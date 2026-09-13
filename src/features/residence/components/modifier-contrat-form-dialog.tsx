import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
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
import {
	normaliserMontantPourBackend,
	validerMontant,
} from "#/core/forms/montant";

import { useModifierContrat } from "../hooks/use-contrats";
import {
	type Contrat,
	TYPE_LOCATION_LABELS,
	type TypeLocation,
} from "../models/contrats";
import type { Logement } from "../models/logements";
import { LogementCascadeField } from "./logement-cascade-field";

/** Champs du formulaire (noms cohérents avec le corps API). */
type ModifierContratField =
	| "idLogement"
	| "dateDebut"
	| "dateSignature"
	| "dureeMois"
	| "typeLocation"
	| "montantLoyer";

/** Propriétés backend (snake_case) → champs du formulaire. */
const FIELD_PROPERTY_TO_FORM: Record<string, ModifierContratField> = {
	id_logement: "idLogement",
	date_debut: "dateDebut",
	date_signature: "dateSignature",
	duree_mois: "dureeMois",
	type_location: "typeLocation",
	montant_loyer: "montantLoyer",
};

interface ModifierContratFormDialogProps {
	/** Contrat EN_ATTENTE à modifier (préremplit le formulaire). */
	contrat: Contrat;
	/** Logement actuel du contrat — préremplit la cascade bâtiment/logement. */
	logement: Logement | undefined;
	onOpenChange: (open: boolean) => void;
	/** Appelé après un enregistrement réussi (ferme la modale). */
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
 * Modale « Modifier le contrat » (PATCH `/contrats/{id}`) — réservée aux
 * contrats EN_ATTENTE (le backend renvoie 400 sinon). Le locataire n'est pas
 * modifiable (`id_client` absent du DTO) ; la caution non plus (onglet
 * dédié). Tous les champs éditables du DTO sont renvoyés, `date_fin_prevue`
 * redéduite de la durée comme à la création. Montée conditionnellement
 * depuis la fiche : `useForm` se réinitialise à chaque ouverture.
 */
export function ModifierContratFormDialog({
	contrat,
	logement,
	onOpenChange,
	onSaved,
}: ModifierContratFormDialogProps) {
	const mutation = useModifierContrat();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			idLogement: contrat.id_logement,
			dateDebut: contrat.date_debut.slice(0, 10),
			dateSignature: contrat.date_signature?.slice(0, 10) ?? "",
			dureeMois: contrat.duree_mois?.toString() ?? "",
			typeLocation: contrat.type_location,
			// Wire money (« 95000.00 ») → saisie (« 95000 »), sans passer par
			// Number (perte de précision possible).
			montantLoyer: contrat.montant_loyer.replace(/\.0+$/, ""),
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<ModifierContratField, string>> = {};
				if (!value.idLogement) fields.idLogement = "Sélectionnez un logement.";
				if (!value.dateDebut.trim()) fields.dateDebut = "Ce champ est requis.";
				if (!value.montantLoyer.trim()) {
					fields.montantLoyer = "Ce champ est requis.";
				} else {
					const erreur = validerMontant(
						value.montantLoyer,
						"Le montant du loyer",
					);
					if (erreur) fields.montantLoyer = erreur;
				}
				if (value.dureeMois) {
					if (!/^\d+$/.test(value.dureeMois.trim())) {
						fields.dureeMois = "Entrez un nombre de mois entier.";
					} else if (Number(value.dureeMois) <= 0) {
						fields.dureeMois = "La durée doit être d'au moins 1 mois.";
					}
				}
				// La date de signature ne peut pas être postérieure à la date de début.
				if (
					value.dateSignature.trim() &&
					value.dateDebut.trim() &&
					value.dateSignature.trim() > value.dateDebut.trim()
				) {
					fields.dateSignature =
						"La date de signature ne peut pas être postérieure à la date de début.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await mutation.mutateAsync({
					id: contrat.id,
					idLogement: value.idLogement,
					dateDebut: value.dateDebut,
					montantLoyer: normaliserMontantPourBackend(value.montantLoyer),
					typeLocation: value.typeLocation,
					dureeMois: value.dureeMois ? Number(value.dureeMois) : null,
					dateSignature: value.dateSignature.trim()
						? value.dateSignature.trim()
						: null,
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
							(toApiError(error).message || "Une erreur est survenue."),
					);
				}
			}
		},
	});

	return (
		<Dialog.Root open onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Modifier le contrat
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Contrat {contrat.numero_contrat} — modifiable tant qu'il est en
						attente.
					</Dialog.Description>

					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<form.Field name="idLogement">
							{(field) => (
								<LogementCascadeField
									value={field.state.value}
									onChange={field.handleChange}
									disponibleUniquement
									batimentInitial={logement?.id_batiment}
									logementActuel={logement}
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

							<form.Field name="dateSignature">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Date de signature"
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
										onValueChange={(valeur) =>
											field.handleChange(valeur as TypeLocation)
										}
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
										onClick={() => onOpenChange(false)}
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
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
