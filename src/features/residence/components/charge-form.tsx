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

import { useCreerCharge } from "../hooks/use-charges";
import type { CategorieCharge } from "../models/charges";
import { LogementCascadeField } from "./logement-cascade-field";

/** Champs du formulaire (noms cohérents avec le corps API). */
type ChargeField = "idLogement" | "idCategorieCharge" | "periode" | "montant";

/** Propriétés backend (snake_case) → champs du formulaire. */
const FIELD_PROPERTY_TO_FORM: Record<string, ChargeField> = {
	id_logement: "idLogement",
	id_categorie_charge: "idCategorieCharge",
	periode: "periode",
	montant: "montant",
};

interface ChargeFormProps {
	/**
	 * Logement fixé (onglet Charges de la fiche logement) ; absent → le
	 * formulaire propose un sélecteur de logement (page « Nouvelle charge »).
	 */
	logementIdParDefaut?: string;
	/** Catégories disponibles (déjà chargées par la page). */
	categories: CategorieCharge[];
	/** Annulation (ferme la modale). */
	onCancel: () => void;
	/** Appelé après un enregistrement réussi. */
	onSaved: () => void;
}

/** Champ Select avec label visible (le contenu s'ouvre en portal). */
function SelectField({
	id,
	label,
	placeholder,
	value,
	onValueChange,
	children,
}: {
	id: string;
	label: string;
	placeholder?: string;
	value: string;
	onValueChange: (value: string) => void;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Select value={value} onValueChange={onValueChange}>
				<SelectTrigger id={id} aria-label={label} className="w-full">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>{children}</SelectContent>
			</Select>
		</div>
	);
}

/**
 * Formulaire « Ajouter une charge » (M2.2), affiché dans une modale au-dessus
 * de la fiche logement. `periode` est un mois (`YYYY-MM`, champ natif).
 */
export function ChargeForm({
	logementIdParDefaut,
	categories,
	onCancel,
	onSaved,
}: ChargeFormProps) {
	const createMutation = useCreerCharge();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			idLogement: logementIdParDefaut ?? "",
			idCategorieCharge: "",
			periode: new Date().toISOString().slice(0, 7),
			montant: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				// `{ fields }` = erreurs champ par champ (cf. login.tsx).
				const fields: Partial<Record<ChargeField, string>> = {};
				if (!value.idLogement) fields.idLogement = "Sélectionnez un logement.";
				if (!value.idCategorieCharge)
					fields.idCategorieCharge = "Ce champ est requis.";
				if (!value.periode.trim()) fields.periode = "Ce champ est requis.";
				if (!value.montant.trim()) {
					fields.montant = "Ce champ est requis.";
				} else if (!/^\d+(\.\d+)?$/.test(value.montant.trim())) {
					fields.montant = "Le montant doit être un nombre.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await createMutation.mutateAsync({
					idLogement: value.idLogement,
					idCategorieCharge: value.idCategorieCharge,
					periode: value.periode,
					montant: value.montant.trim(),
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
				// Erreur globale (réseau…) sinon.
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
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			{!logementIdParDefaut ? (
				<form.Field name="idLogement">
					{(field) => (
						<LogementCascadeField
							value={field.state.value}
							onChange={field.handleChange}
						/>
					)}
				</form.Field>
			) : null}

			<form.Field name="idCategorieCharge">
				{(field) => (
					<SelectField
						id={field.name}
						label="Catégorie"
						placeholder="Sélectionner une catégorie"
						value={field.state.value}
						onValueChange={field.handleChange}
					>
						{categories.map((categorie) => (
							<SelectItem key={categorie.id} value={categorie.id}>
								{categorie.libelle}
							</SelectItem>
						))}
					</SelectField>
				)}
			</form.Field>

			<form.Field name="periode">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Période (mois)"
						type="month"
						autoComplete="off"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<form.Field name="montant">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Montant (FCFA)"
						placeholder="ex : 25000"
						inputMode="numeric"
						autoComplete="off"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

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
