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

import { useCreerContrat } from "../hooks/use-contrats";
import { TYPE_LOCATION_LABELS, type TypeLocation } from "../models/contrats";
import { ClientRechercheField } from "./client-recherche-field";
import { LogementCascadeField } from "./logement-cascade-field";

/** Champs du formulaire (noms cohérents avec le corps API). */
type ContratField =
	| "idClient"
	| "idLogement"
	| "dateDebut"
	| "dureeMois"
	| "typeLocation"
	| "montantLoyer"
	| "periodicite";

/** Propriétés backend (snake_case) → champs du formulaire. */
const FIELD_PROPERTY_TO_FORM: Record<string, ContratField> = {
	id_client: "idClient",
	id_logement: "idLogement",
	date_debut: "dateDebut",
	duree_mois: "dureeMois",
	type_location: "typeLocation",
	montant_loyer: "montantLoyer",
	periodicite: "periodicite",
};

interface ContratFormProps {
	/** Annulation (ferme la modale). */
	onCancel: () => void;
	/** Appelé après un enregistrement réussi (ferme la modale côté liste). */
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
 * Formulaire « Nouveau contrat de location » (M2.2), affiché dans une modale
 * au-dessus de la liste des contrats. Recherche de client (base unique,
 * création inline si absent), sélection du logement par cascade bâtiment →
 * logement, dates/durée/type/loyer/périodicité. L'enregistrement POST
 * `/contrats` génère les échéances côté backend. La caution n'est PAS dans le
 * formulaire (absente de `CreerContratDto`).
 */
export function ContratForm({ onCancel, onSaved }: ContratFormProps) {
	const createMutation = useCreerContrat();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			idClient: "",
			idLogement: "",
			dateDebut: "",
			dureeMois: "",
			typeLocation: "MENSUEL" as TypeLocation,
			montantLoyer: "",
			periodicite: "Mensuel",
		},
		validators: {
			onSubmit: ({ value }) => {
				// `{ fields }` = erreurs champ par champ (cf. login.tsx).
				const fields: Partial<Record<ContratField, string>> = {};
				if (!value.idClient) fields.idClient = "Sélectionnez un client.";
				if (!value.idLogement) fields.idLogement = "Sélectionnez un logement.";
				if (!value.dateDebut.trim()) fields.dateDebut = "Ce champ est requis.";
				if (!value.montantLoyer.trim()) {
					fields.montantLoyer = "Ce champ est requis.";
				} else if (!/^\d+(\.\d+)?$/.test(value.montantLoyer.trim())) {
					fields.montantLoyer = "Le montant doit être un nombre.";
				}
				if (value.dureeMois && !/^\d+$/.test(value.dureeMois.trim())) {
					fields.dureeMois = "Entrez un nombre de mois entier.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await createMutation.mutateAsync({
					idClient: value.idClient,
					idLogement: value.idLogement,
					dateDebut: value.dateDebut,
					montantLoyer: value.montantLoyer.trim(),
					typeLocation: value.typeLocation,
					dureeMois: value.dureeMois ? Number(value.dureeMois) : null,
					periodicite: value.periodicite,
				});
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
							"Une erreur est survenue.",
					);
				}
			}
		},
	});

	return (
		<form
			className="space-y-4"
			onSubmit={(event) => {
				console.log(
					"[DEBUG-client] ⚠️ submit reçu par le formulaire PARENT (contrat) — l'événement de l'inner form a débordé ?",
				);
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<form.Field name="idClient">
				{(field) => (
					<ClientRechercheField
						value={field.state.value}
						onChange={(id) => field.handleChange(id)}
						creationLocataireComplete
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

			<div className="grid gap-4 sm:grid-cols-2">
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

				<form.Field name="dureeMois">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Durée (en mois)"
							placeholder="ex : 12"
							inputMode="numeric"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				<form.Field name="typeLocation">
					{(field) => (
						<SelectField
							id={field.name}
							label="Type de location"
							value={field.state.value}
							onValueChange={(valeur) => {
								const type = valeur as TypeLocation;
								field.handleChange(type);
								// Périodicité auto-synchronisée (éditable ensuite).
								form.setFieldValue(
									"periodicite",
									type === "MENSUEL" ? "Mensuel" : "Annuel",
								);
							}}
						>
							{(Object.keys(TYPE_LOCATION_LABELS) as TypeLocation[]).map(
								(type) => (
									<SelectItem key={type} value={type}>
										{TYPE_LOCATION_LABELS[type]}
									</SelectItem>
								),
							)}
						</SelectField>
					)}
				</form.Field>

				<form.Field name="periodicite">
					{(field) => (
						<SelectField
							id={field.name}
							label="Périodicité"
							value={field.state.value}
							onValueChange={field.handleChange}
						>
							<SelectItem value="Mensuel">Mensuelle</SelectItem>
							<SelectItem value="Annuel">Annuelle</SelectItem>
						</SelectField>
					)}
				</form.Field>

				<form.Field name="montantLoyer">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Montant du loyer (FCFA)"
							placeholder="ex : 95000"
							inputMode="numeric"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>
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
