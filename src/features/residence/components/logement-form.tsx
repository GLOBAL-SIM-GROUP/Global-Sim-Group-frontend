import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import type * as React from "react";
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
import { Textarea } from "#/components/ui/textarea";
import { getErrorMessageForCode, getFieldErrors, toApiError } from "#/core/api";

import { useCreerLogement, useModifierLogement } from "../hooks/use-logements";
import type { Batiment } from "../models/batiments";
import {
	LOGEMENT_STATUT_LABELS,
	LOGEMENT_TYPE_LABELS,
	type Logement,
	type LogementStatut,
	type LogementType,
} from "../models/logements";

/** Champs du formulaire (noms cohérents avec le model). */
type LogementField =
	| "idBatiment"
	| "numero"
	| "type"
	| "tarif"
	| "equipements"
	| "statut"
	| "etat";

/** Propriétés backend (snake_case) → champs du formulaire. */
const FIELD_PROPERTY_TO_FORM: Record<string, LogementField> = {
	numero: "numero",
	type: "type",
	tarif: "tarif",
	statut: "statut",
	id_batiment: "idBatiment",
	equipements: "equipements",
	etat: "etat",
};

interface LogementFormProps {
	/** Logement à modifier (mode édition) ; null = création. */
	logement: Logement | null;
	/** Bâtiments disponibles pour le champ « Bâtiment » (déjà chargés par la page). */
	batiments: Batiment[];
	/** Bâtiment pré-sélectionné en mode création (bâtiment courant de la page). */
	batimentIdParDefaut?: string;
	/** Annulation (ferme la modale) — la feature ne navigue pas. */
	onCancel: () => void;
	/** Appelé après un enregistrement réussi. */
	onSaved: () => void;
}

/**
 * Champ Select avec label visible. Le trigger porte `id`/`aria-label` (le label
 * est lié via `htmlFor`) ; le contenu s'ouvre en portal (échappe la modale).
 */
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

/** Champ textarea avec label + message d'erreur (pattern `InputField`). */
function TextareaField({
	id,
	label,
	placeholder,
	value,
	onChange,
	error,
}: {
	id: string;
	label: string;
	placeholder?: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
}) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Textarea
				id={id}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				aria-invalid={error ? true : undefined}
			/>
			{error ? <p className="text-sm text-destructive">{error}</p> : null}
		</div>
	);
}

/**
 * Formulaire « Ajouter / Modifier un logement » (M2.2), affiché dans une
 * modale au-dessus de la liste. En édition, le logement est passé tel quel par
 * la page (déjà en mémoire) — le GET par id existe mais n'est pas nécessaire.
 * Permission : gérée par la visibilité des boutons qui ouvrent la modale.
 */
export function LogementForm({
	logement,
	batiments,
	batimentIdParDefaut,
	onCancel,
	onSaved,
}: LogementFormProps) {
	const createMutation = useCreerLogement();
	const editMutation = useModifierLogement();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			idBatiment: logement?.id_batiment ?? batimentIdParDefaut ?? "",
			numero: logement?.numero ?? "",
			type: logement?.type ?? "CHAMBRE",
			tarif: logement?.tarif ?? "",
			equipements: logement?.equipements ?? "",
			statut: logement?.statut ?? "DISPONIBLE",
			etat: logement?.etat ?? "",
		},
		validators: {
			onSubmit: ({ value }) => {
				// `{ fields }` = erreurs champ par champ (cf. login.tsx).
				// Pas de contrôle sur `numero` : généré par le backend en création,
				// non modifiable (champ désactivé) en édition.
				const fields: Partial<Record<LogementField, string>> = {};
				if (!value.idBatiment.trim())
					fields.idBatiment = "Ce champ est requis.";
				if (!value.tarif.trim()) {
					fields.tarif = "Ce champ est requis.";
				} else if (!/^\d+(\.\d+)?$/.test(value.tarif.trim())) {
					fields.tarif = "Le tarif doit être un montant numérique.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const corpsCommun = {
					type: value.type,
					tarif: value.tarif.trim(),
					statut: value.statut,
					idBatiment: value.idBatiment,
					equipements: value.equipements,
					etat: value.etat,
				};
				if (logement) {
					// Mode édition : `logement` est non-null (dérivé de la prop). Le
					// numéro est désactivé dans le formulaire (généré par le backend) :
					// on renvoie sa valeur inchangée.
					await editMutation.mutateAsync({
						id: logement.id,
						numero: value.numero,
						...corpsCommun,
					});
				} else {
					// Création : pas de `numero` — le backend l'assigne lui-même.
					await createMutation.mutateAsync(corpsCommun);
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
				// Erreur globale (réseau, numéro déjà utilisé non mappable…) sinon.
				// Le backend renvoie souvent un message déjà clair et actionnable en
				// français (ex. « Bâtiment inactif : impossible d'y créer un
				// logement ») pour des codes qui n'ont pas de mapping dédié
				// (BAD_REQUEST…) — on l'affiche plutôt qu'un message générique qui
				// masquerait l'information utile.
				if (mappedFields === 0) {
					const apiError = toApiError(error);
					setGlobalError(
						getErrorMessageForCode(apiError.code) ??
							(apiError.message || "Une erreur est survenue."),
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
			<form.Field name="idBatiment">
				{(field) => (
					<SelectField
						id={field.name}
						label="Bâtiment"
						placeholder="Sélectionner un bâtiment"
						value={field.state.value}
						onValueChange={field.handleChange}
					>
						{batiments.map((batiment) => (
							<SelectItem key={batiment.id} value={batiment.id}>
								{batiment.code} — {batiment.nom}
							</SelectItem>
						))}
					</SelectField>
				)}
			</form.Field>

			{logement ? (
				// Le numéro est généré par le backend (ex. GSG-ST01-Y) : affiché en
				// édition à titre indicatif, non modifiable ; absent en création,
				// l'utilisateur n'a rien à saisir.
				<form.Field name="numero">
					{(field) => (
						<div className="space-y-1.5">
							<InputField
								id={field.name}
								name={field.name}
								label="Numéro"
								value={field.state.value}
								disabled
							/>
							<p className="text-xs text-muted-foreground">
								Généré automatiquement, non modifiable.
							</p>
						</div>
					)}
				</form.Field>
			) : null}

			<form.Field name="type">
				{(field) => (
					<SelectField
						id={field.name}
						label="Type"
						value={field.state.value}
						onValueChange={(value) => field.handleChange(value as LogementType)}
					>
						{(Object.keys(LOGEMENT_TYPE_LABELS) as LogementType[]).map(
							(type) => (
								<SelectItem key={type} value={type}>
									{LOGEMENT_TYPE_LABELS[type]}
								</SelectItem>
							),
						)}
					</SelectField>
				)}
			</form.Field>

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

			<form.Field name="equipements">
				{(field) => (
					<TextareaField
						id={field.name}
						label="Équipements"
						placeholder="ex : lit, climatisation, douche…"
						value={field.state.value}
						onChange={field.handleChange}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<form.Field name="statut">
				{(field) => (
					<SelectField
						id={field.name}
						label="Statut"
						value={field.state.value}
						onValueChange={(value) =>
							field.handleChange(value as LogementStatut)
						}
					>
						{(Object.keys(LOGEMENT_STATUT_LABELS) as LogementStatut[]).map(
							(statut) => (
								<SelectItem key={statut} value={statut}>
									{LOGEMENT_STATUT_LABELS[statut]}
								</SelectItem>
							),
						)}
					</SelectField>
				)}
			</form.Field>

			<form.Field name="etat">
				{(field) => (
					<TextareaField
						id={field.name}
						label="État"
						placeholder="ex : bon état, rénové récemment…"
						value={field.state.value}
						onChange={field.handleChange}
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
