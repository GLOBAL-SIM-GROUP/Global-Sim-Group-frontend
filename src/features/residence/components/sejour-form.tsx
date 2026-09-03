import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { getErrorMessageForCode, getFieldErrors, toApiError } from "#/core/api";

import { useCreerSejour, useModifierSejour } from "../hooks/use-sejours";
import type { MoyenPaiement } from "../models/moyens-paiement";
import {
	SEJOUR_STATUT_LABELS,
	SEJOUR_TYPE_LABELS,
	type Sejour,
	type SejourStatut,
	type SejourType,
} from "../models/sejours";
import { ClientRechercheField } from "./client-recherche-field";
import { LogementCascadeField } from "./logement-cascade-field";

/** Champs du formulaire (noms cohérents avec le corps API). */
type SejourField =
	| "typePrestation"
	| "idClient"
	| "idLogement"
	| "arrivee"
	| "depart"
	| "tarif"
	| "statut";

/** Propriétés backend (snake_case) → champs du formulaire. */
const FIELD_PROPERTY_TO_FORM: Record<string, SejourField> = {
	type_prestation: "typePrestation",
	id_client: "idClient",
	id_logement: "idLogement",
	date_heure_arrivee: "arrivee",
	date_heure_depart_prevue: "depart",
	tarif: "tarif",
	statut: "statut",
};

/** `Date` → valeur `datetime-local` (ex. « 2026-08-20T20:00 »). */
function toDateTimeLocal(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
		date.getDate(),
	)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** `"2026-08-20 20:00:00"` (backend) → valeur `datetime-local`. */
function toLocalInput(dateHeure: string | null | undefined): string {
	if (!dateHeure) return "";
	return dateHeure.slice(0, 16).replace(" ", "T");
}

/** Valeur `datetime-local` → `"2026-08-20 20:00:00"` (backend) ; vide → "". */
function toBackend(dateHeure: string): string {
	return dateHeure ? `${dateHeure.replace("T", " ")}:00` : "";
}

interface SejourFormProps {
	/** Séjour à modifier (mode édition) ; null = création. */
	sejour: Sejour | null;
	/** Moyens de paiement (module Finances) ; vide si aucun. */
	moyens: MoyenPaiement[];
	onCancel: () => void;
	onSaved: () => void;
}

/** Champ Select avec label visible (le contenu s'ouvre en portal). */
function SelectField({
	id,
	label,
	value,
	onValueChange,
	children,
}: {
	id: string;
	label: string;
	value: string;
	onValueChange: (value: string) => void;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Select value={value} onValueChange={onValueChange}>
				<SelectTrigger id={id} aria-label={label} className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>{children}</SelectContent>
			</Select>
		</div>
	);
}

/**
 * Formulaire « Nouvelle nuitée / Nouvelle sieste » (M2.3), affiché dans une
 * modale au-dessus de la liste. En création : recherche de client (base unique,
 * création de passage inline), logement (cascade), dates/heures, tarif et
 * paiement initial optionnel. En édition : prestation, dates, tarif, statut.
 */
export function SejourForm({
	sejour,
	moyens,
	onCancel,
	onSaved,
}: SejourFormProps) {
	const createMutation = useCreerSejour();
	const editMutation = useModifierSejour();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			typePrestation: sejour?.type_prestation ?? ("NUITEE" as SejourType),
			idClient: "",
			idLogement: "",
			arrivee: sejour
				? toLocalInput(sejour.date_heure_arrivee)
				: toDateTimeLocal(new Date()),
			depart: toLocalInput(sejour?.date_heure_depart_prevue),
			tarif: sejour?.tarif ?? "",
			statut: sejour?.statut ?? ("EN_COURS" as SejourStatut),
			moyenPaiement: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				// `{ fields }` = erreurs champ par champ (cf. login.tsx).
				const fields: Partial<Record<SejourField, string>> = {};
				if (!sejour) {
					if (!value.idClient) fields.idClient = "Sélectionnez un client.";
					if (!value.idLogement)
						fields.idLogement = "Sélectionnez un logement.";
				}
				if (!value.arrivee.trim()) fields.arrivee = "Ce champ est requis.";
				if (!value.tarif.trim()) {
					fields.tarif = "Ce champ est requis.";
				} else if (!/^\d+(\.\d+)?$/.test(value.tarif.trim())) {
					fields.tarif = "Le tarif doit être un nombre.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				if (sejour) {
					await editMutation.mutateAsync({
						id: sejour.id,
						typePrestation: value.typePrestation,
						dateHeureArrivee: toBackend(value.arrivee),
						dateHeureDepartPrevue: toBackend(value.depart) || null,
						tarif: value.tarif.trim(),
						statut: value.statut,
					});
				} else {
					await createMutation.mutateAsync({
						typePrestation: value.typePrestation,
						idLogement: value.idLogement,
						dateHeureArrivee: toBackend(value.arrivee),
						dateHeureDepartPrevue: toBackend(value.depart) || null,
						tarif: value.tarif.trim(),
						idClient: value.idClient,
						paiement: value.moyenPaiement
							? {
									montant: value.tarif.trim(),
									idMoyen: value.moyenPaiement,
								}
							: null,
					});
				}
				onSaved();
			} catch (error) {
				// Erreurs de validation backend → champ par champ (details[].property).
				let mappedFields = 0;
				for (const detail of getFieldErrors(error)) {
					const formField = FIELD_PROPERTY_TO_FORM[detail.property];
					if (formField && detail.messages.length > 0) {
						form.setFieldMeta(formField, (prev) => ({
							...prev,
							errorMap: {
								...prev.errorMap,
								onServer: detail.messages.join(" · "),
							},
						}));
						mappedFields += 1;
					}
				}
				if (mappedFields === 0) {
					setGlobalError(
						getErrorMessageForCode(toApiError(error).code) ??
							(toApiError(error).message || "Une erreur est survenue."),
					);
				}
			}
		},
	});

	return (
		<form
			className="space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<form.Field name="typePrestation">
				{(field) => (
					<SelectField
						id={field.name}
						label="Type"
						value={field.state.value}
						onValueChange={(valeur) => field.handleChange(valeur as SejourType)}
					>
						{(Object.keys(SEJOUR_TYPE_LABELS) as SejourType[]).map((type) => (
							<SelectItem key={type} value={type}>
								{SEJOUR_TYPE_LABELS[type]}
							</SelectItem>
						))}
					</SelectField>
				)}
			</form.Field>

			{!sejour ? (
				<>
					<form.Field name="idClient">
						{(field) => (
							<ClientRechercheField
								value={field.state.value}
								onChange={(id) => field.handleChange(id)}
							/>
						)}
					</form.Field>

					<form.Field name="idLogement">
						{(field) => (
							<LogementCascadeField
								value={field.state.value}
								onChange={field.handleChange}
							/>
						)}
					</form.Field>
				</>
			) : null}

			<form.Field name="arrivee">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Date et heure d'arrivée"
						type="datetime-local"
						autoComplete="off"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<form.Field name="depart">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Départ prévu (optionnel)"
						type="datetime-local"
						autoComplete="off"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="tarif">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Tarif (FCFA)"
							placeholder="ex : 35000"
							inputMode="numeric"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				{sejour ? (
					<form.Field name="statut">
						{(field) => (
							<SelectField
								id={field.name}
								label="Statut"
								value={field.state.value}
								onValueChange={(valeur) =>
									field.handleChange(valeur as SejourStatut)
								}
							>
								{(Object.keys(SEJOUR_STATUT_LABELS) as SejourStatut[]).map(
									(statut) => (
										<SelectItem key={statut} value={statut}>
											{SEJOUR_STATUT_LABELS[statut]}
										</SelectItem>
									),
								)}
							</SelectField>
						)}
					</form.Field>
				) : moyens.length > 0 ? (
					<form.Field name="moyenPaiement">
						{(field) => (
							<SelectField
								id={field.name}
								label="Moyen de paiement (optionnel)"
								value={field.state.value}
								onValueChange={field.handleChange}
							>
								{moyens.map((moyen) => (
									<SelectItem key={moyen.id} value={moyen.id}>
										{moyen.libelle}
									</SelectItem>
								))}
							</SelectField>
						)}
					</form.Field>
				) : null}
			</div>

			{globalError ? (
				<p role="alert" className="text-sm font-medium text-destructive">
					{globalError}
				</p>
			) : null}

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<div className="flex items-center justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="ghost"
							disabled={isSubmitting}
							onClick={onCancel}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							{isSubmitting ? "Enregistrement…" : "Enregistrer"}
						</Button>
					</div>
				)}
			</form.Subscribe>
		</form>
	);
}
