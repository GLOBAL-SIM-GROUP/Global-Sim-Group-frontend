import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
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

import { useAbonnementCategories } from "../hooks/use-abonnement-categories";
import {
	useCreerAbonnement,
	useModifierAbonnement,
} from "../hooks/use-abonnements";
import {
	ABONNEMENT_STATUT_LABELS,
	ABONNEMENT_TYPE_LABELS,
	type Abonnement,
	type AbonnementStatut,
	type AbonnementType,
} from "../models/abonnements";
import { ClientRechercheField } from "./client-recherche-field";

/** Champs du formulaire (noms cohérents avec le corps API). */
type AbonnementField =
	| "idClient"
	| "service"
	| "type"
	| "montant"
	| "dateDebut"
	| "dateFin"
	| "statut";

/** Propriétés backend (snake_case) → champs du formulaire. */
const FIELD_PROPERTY_TO_FORM: Record<string, AbonnementField> = {
	id_client: "idClient",
	service: "service",
	type: "type",
	montant: "montant",
	date_debut: "dateDebut",
	date_fin: "dateFin",
	statut: "statut",
};

interface AbonnementFormProps {
	/** Abonnement à modifier (mode édition) ; null = création. */
	abonnement: Abonnement | null;
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
 * Formulaire « Nouvel abonnement » (M2.4), affiché dans une modale. En
 * création : recherche du résident (client), service, type, montant, dates.
 * En édition : service, type, montant, dates, statut.
 */
export function AbonnementForm({
	abonnement,
	onCancel,
	onSaved,
}: AbonnementFormProps) {
	const createMutation = useCreerAbonnement();
	const editMutation = useModifierAbonnement();
	const categoriesQuery = useAbonnementCategories();
	const categories = categoriesQuery.data ?? [];
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			idClient: "",
			service: abonnement?.service ?? "",
			type: abonnement?.type ?? ("MENSUEL" as AbonnementType),
			montant: abonnement?.montant ?? "",
			dateDebut: abonnement?.date_debut ?? "",
			dateFin: abonnement?.date_fin ?? "",
			statut: abonnement?.statut ?? ("ACTIF" as AbonnementStatut),
		},
		validators: {
			onSubmit: ({ value }) => {
				// `{ fields }` = erreurs champ par champ (cf. login.tsx).
				const fields: Partial<Record<AbonnementField, string>> = {};
				if (!abonnement && !value.idClient)
					fields.idClient = "Sélectionnez un résident.";
				if (!value.service.trim()) fields.service = "Ce champ est requis.";
				if (!value.montant.trim()) {
					fields.montant = "Ce champ est requis.";
				} else if (!/^\d+(\.\d+)?$/.test(value.montant.trim())) {
					fields.montant = "Le montant doit être un nombre.";
				}
				if (!value.dateDebut.trim()) fields.dateDebut = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				if (abonnement) {
					await editMutation.mutateAsync({
						id: abonnement.id,
						service: value.service.trim(),
						type: value.type,
						montant: value.montant.trim(),
						dateDebut: value.dateDebut,
						dateFin: value.dateFin || null,
						statut: value.statut,
					});
				} else {
					await createMutation.mutateAsync({
						idClient: value.idClient,
						service: value.service.trim(),
						type: value.type,
						montant: value.montant.trim(),
						dateDebut: value.dateDebut,
						dateFin: value.dateFin || null,
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
			{!abonnement ? (
				<form.Field name="idClient">
					{(field) => (
						<ClientRechercheField
							value={field.state.value}
							onChange={(id) => field.handleChange(id)}
						/>
					)}
				</form.Field>
			) : null}

			<form.Field name="service">
				{(field) => {
					// L'abonnement modifié peut porter un service qui ne correspond plus
					// à aucune catégorie active (catégorie supprimée depuis, ou ancienne
					// saisie libre d'avant l'introduction des catégories) — on l'ajoute
					// à la liste pour ne pas vider silencieusement le champ à l'édition.
					const libellesConnus = new Set(categories.map((c) => c.libelle));
					const valeurHorsListe =
						field.state.value && !libellesConnus.has(field.state.value)
							? field.state.value
							: null;
					return (
						<div className="space-y-2">
							<SelectField
								id={field.name}
								label="Service (catégorie)"
								value={field.state.value}
								onValueChange={field.handleChange}
							>
								{valeurHorsListe ? (
									<SelectItem value={valeurHorsListe}>
										{valeurHorsListe}
									</SelectItem>
								) : null}
								{categories.map((categorie) => (
									<SelectItem key={categorie.id} value={categorie.libelle}>
										{categorie.libelle}
									</SelectItem>
								))}
							</SelectField>
							{field.state.meta.errors[0] ? (
								<p className="text-xs text-destructive">
									{field.state.meta.errors[0]}
								</p>
							) : null}
							{!categoriesQuery.isLoading && categories.length === 0 ? (
								<p className="text-xs text-muted-foreground">
									Aucune catégorie configurée —{" "}
									<Link
										to="/residence/categories-abonnements"
										className="text-lagoon hover:underline"
									>
										ajoutez-en une
									</Link>{" "}
									avant de continuer.
								</p>
							) : null}
						</div>
					);
				}}
			</form.Field>

			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="type">
					{(field) => (
						<SelectField
							id={field.name}
							label="Type"
							value={field.state.value}
							onValueChange={(valeur) =>
								field.handleChange(valeur as AbonnementType)
							}
						>
							{(Object.keys(ABONNEMENT_TYPE_LABELS) as AbonnementType[]).map(
								(type) => (
									<SelectItem key={type} value={type}>
										{ABONNEMENT_TYPE_LABELS[type]}
									</SelectItem>
								),
							)}
						</SelectField>
					)}
				</form.Field>

				<form.Field name="montant">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Montant (FCFA)"
							placeholder="ex : 15000"
							inputMode="numeric"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				<form.Field name="dateDebut">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Date de début"
							type="date"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				<form.Field name="dateFin">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Date de fin (optionnelle)"
							type="date"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				{abonnement ? (
					<form.Field name="statut">
						{(field) => (
							<SelectField
								id={field.name}
								label="Statut"
								value={field.state.value}
								onValueChange={(valeur) =>
									field.handleChange(valeur as AbonnementStatut)
								}
							>
								{(
									Object.keys(ABONNEMENT_STATUT_LABELS) as AbonnementStatut[]
								).map((statut) => (
									<SelectItem key={statut} value={statut}>
										{ABONNEMENT_STATUT_LABELS[statut]}
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
