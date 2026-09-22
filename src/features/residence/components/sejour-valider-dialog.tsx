import { useForm } from "@tanstack/react-form";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { toApiError } from "#/core/api";
import {
	normaliserMontantPourBackend,
	validerMontant,
} from "#/core/forms/montant";

import { useLogement } from "../hooks/use-logements";
import { useValiderSejour } from "../hooks/use-sejours";
import type { Sejour } from "../models/sejours";
import { LogementCascadeField } from "./logement-cascade-field";

interface ValiderSejourDialogProps {
	open: boolean;
	sejour: Sejour | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Valider la demande » d'un séjour `EN_ATTENTE` (POST
 * `/residence/sejours/{id}/valider`, `RESIDENCE.VALIDER`) : chiffrage
 * (`tarif` requis, `montant_total` optionnel — le tarif fait foi) et logement
 * de substitution (pré-rempli avec celui demandé par le client — renvoyé tel
 * quel si inchangé ; un autre logement peut être choisi).
 *
 * Le `409` de disponibilité est un cas normal : le logement choisi a pu être
 * occupé entre la demande et la validation — l'erreur est distinguée et le
 * sélecteur reste ouvert pour en proposer un autre.
 */
export function ValiderSejourDialog({
	open,
	sejour,
	onOpenChange,
	onSaved,
}: ValiderSejourDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Valider la demande de séjour
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{sejour
							? `Logement demandé : ${sejour.numero_logement} — la validation passe le séjour « En cours » et notifie le client.`
							: "Chiffrage et validation de la demande."}
					</Dialog.Description>

					{sejour ? (
						<ValiderSejourForm
							key={sejour.id}
							sejour={sejour}
							onOpenChange={onOpenChange}
							onSaved={onSaved}
						/>
					) : null}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

interface ValiderSejourFormProps {
	sejour: Sejour;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Formulaire de validation — composant distinct monté avec `sejour` déjà
 * connu : `idLogement` entre dans `defaultValues` à la création du form
 * (pré-sélection du logement demandé), comme pour `ModifierContratDialog` —
 * pas d'écriture `setFieldValue` post-montage.
 */
function ValiderSejourForm({
	sejour,
	onOpenChange,
	onSaved,
}: ValiderSejourFormProps) {
	const mutation = useValiderSejour();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [indisponible, setIndisponible] = useState(false);

	// Détail du logement demandé : donne `id_batiment` pour présélectionner
	// la cascade Bâtiment → Logement (la réponse séjour ne le porte pas).
	const logementDemandeQuery = useLogement(sejour.id_logement);
	const logementDemande = logementDemandeQuery.data;

	const form = useForm({
		defaultValues: {
			tarif: "",
			montantTotal: "",
			idLogement: sejour.id_logement,
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<"tarif" | "montantTotal", string>> = {};
				if (!value.tarif.trim()) {
					fields.tarif = "Le tarif est requis.";
				} else {
					const erreur = validerMontant(value.tarif, "Le tarif");
					if (erreur) fields.tarif = erreur;
				}
				if (value.montantTotal.trim()) {
					const erreur = validerMontant(value.montantTotal, "Le montant total");
					if (erreur) fields.montantTotal = erreur;
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			setIndisponible(false);
			try {
				await mutation.mutateAsync({
					id: sejour.id,
					tarif: normaliserMontantPourBackend(value.tarif),
					...(value.idLogement ? { idLogement: value.idLogement } : {}),
					...(value.montantTotal.trim()
						? {
								montantTotal: normaliserMontantPourBackend(value.montantTotal),
							}
						: {}),
				});
				onSaved();
			} catch (error) {
				const apiError = toApiError(error);
				if (apiError.status === 409) {
					// Logement pris entre-temps ou demande déjà traitée — le staff
					// peut choisir un autre logement sans fermer la modale.
					setIndisponible(true);
				}
				setGlobalError(apiError.message || "Impossible de valider la demande.");
			}
		},
	});

	return (
		<form
			className="mt-4 space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<form.Field name="tarif">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Tarif du séjour (FCFA) *"
						inputMode="numeric"
						autoComplete="off"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<form.Field name="montantTotal">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Montant total (optionnel — le tarif fait foi)"
						inputMode="numeric"
						autoComplete="off"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<form.Field name="idLogement">
				{(field) => (
					<div className="space-y-2">
						<LogementCascadeField
							value={field.state.value}
							onChange={field.handleChange}
							disponibleUniquement
							batimentInitial={logementDemande?.id_batiment}
							logementActuel={logementDemande}
						/>
						<p className="text-xs text-muted-foreground">
							Logement demandé par le client présélectionné ; choisissez-en un
							autre s'il n'est plus disponible.
						</p>
					</div>
				)}
			</form.Field>

			{indisponible ? (
				<div
					role="alert"
					className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
				>
					<AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
					<span>
						{globalError ??
							"Le logement choisi n'est plus disponible — sélectionnez-en un autre."}
					</span>
				</div>
			) : globalError ? (
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
							{isSubmitting ? "Validation…" : "Valider la demande"}
						</Button>
					</div>
				)}
			</form.Subscribe>
		</form>
	);
}
