import { useForm } from "@tanstack/react-form";
import { Loader2, MapPin } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";
import { getErrorMessageForCode, getFieldErrors, toApiError } from "#/core/api";

import { useCreerBatiment, useModifierBatiment } from "../hooks/use-batiments";
import type { Batiment } from "../models/batiments";

/** Champs du formulaire (noms cohérents avec le model). */
type BatimentField = "code" | "nom" | "adresse" | "actif";

/** Propriétés backend (snake_case) → champs du formulaire. */
const FIELD_PROPERTY_TO_FORM: Record<string, BatimentField> = {
	code: "code",
	nom: "nom",
	adresse: "adresse",
	actif: "actif",
};

interface BatimentFormProps {
	/** Bâtiment à modifier (mode édition) ; null = création. */
	batiment: Batiment | null;
	/** Annulation (ferme la modale) — la feature ne navigue pas. */
	onCancel: () => void;
	/** Appelé après un enregistrement réussi. */
	onSaved: () => void;
}

/**
 * Formulaire « Ajouter / Modifier un bâtiment » (M2.1), affiché dans une
 * modale au-dessus de la liste. En édition, le bâtiment est passé tel quel par
 * la page (déjà en mémoire) — pas de GET par id dans le spec. Permission :
 * gérée par la visibilité des boutons qui ouvrent la modale.
 */
export function BatimentForm({
	batiment,
	onCancel,
	onSaved,
}: BatimentFormProps) {
	const createMutation = useCreerBatiment();
	const editMutation = useModifierBatiment();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			code: batiment?.code ?? "",
			nom: batiment?.nom ?? "",
			adresse: batiment?.adresse ?? "",
			actif: batiment?.actif ?? true,
		},
		validators: {
			onSubmit: ({ value }) => {
				// `{ fields }` = erreurs champ par champ (cf. login.tsx).
				const fields: Partial<Record<"code" | "nom", string>> = {};
				if (!value.code.trim()) fields.code = "Ce champ est requis.";
				if (!value.nom.trim()) fields.nom = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const corps = {
					code: value.code.trim(),
					nom: value.nom.trim(),
					actif: value.actif,
					adresse: value.adresse.trim() === "" ? null : value.adresse.trim(),
				};
				if (batiment) {
					// Mode édition : `batiment` est non-null (dérivé de la prop).
					await editMutation.mutateAsync({ id: batiment.id, ...corps });
				} else {
					await createMutation.mutateAsync(corps);
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
				// Erreur globale (réseau, code déjà utilisé non mappable…) sinon.
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
			<form.Field name="code">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Code"
						placeholder="ex : A, B"
						autoComplete="off"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<form.Field name="nom">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Nom"
						placeholder="ex : Bâtiment A"
						autoComplete="off"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<form.Field name="adresse">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Adresse (optionnel)"
						placeholder="ex : Cocody Riviera 3"
						autoComplete="off"
						icon={<MapPin className="size-4" aria-hidden />}
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<form.Field name="actif">
				{(field) => (
					<div className="flex items-center gap-3">
						<Label htmlFor={field.name}>Actif</Label>
						<Switch
							id={field.name}
							checked={field.state.value}
							onCheckedChange={field.handleChange}
						/>
					</div>
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
