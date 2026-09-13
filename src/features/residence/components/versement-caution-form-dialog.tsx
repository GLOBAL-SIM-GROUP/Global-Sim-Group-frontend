import { useForm } from "@tanstack/react-form";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import {
	getErrorMessageForCode,
	isCaisseFermeeError,
	toApiError,
} from "#/core/api";
import {
	normaliserMontantPourBackend,
	validerMontant,
} from "#/core/forms/montant";

import { useVersementCaution } from "../hooks/use-contrats";

interface VersementCautionFormDialogProps {
	open: boolean;
	idContrat: string;
	/** Montant de la caution, préremplissage éditable du champ montant. */
	montantCaution: string;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

function dateAujourdhui(): string {
	return new Date().toISOString().slice(0, 10);
}

/**
 * Modale « Déclarer le versement » (POST `/contrats/{id}/caution/versement`) :
 * enregistre que le résident a payé sa caution — simple déclaration/traçabilité,
 * aucun encaissement de caisse n'est créé. Date (défaut aujourd'hui) et montant
 * (préremplis, éditables).
 */
export function VersementCautionFormDialog({
	open,
	idContrat,
	montantCaution,
	onOpenChange,
	onSaved,
}: VersementCautionFormDialogProps) {
	const mutation = useVersementCaution();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [caisseFermee, setCaisseFermee] = useState(false);

	const form = useForm({
		defaultValues: {
			dateVersement: dateAujourdhui(),
			montant: montantCaution,
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (value.montant.trim()) {
					const erreur = validerMontant(value.montant, "Le montant");
					if (erreur) fields.montant = erreur;
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			setCaisseFermee(false);
			try {
				await mutation.mutateAsync({
					idContrat,
					dateVersement: value.dateVersement || null,
					montant: value.montant.trim()
						? normaliserMontantPourBackend(value.montant)
						: null,
				});
				onSaved();
			} catch (error) {
				const apiError = toApiError(error);
				if (isCaisseFermeeError(apiError)) {
					setCaisseFermee(true);
					setGlobalError(apiError.message);
				} else {
					setGlobalError(
						getErrorMessageForCode(apiError.code) ??
							(apiError.message || "Une erreur est survenue."),
					);
				}
			}
		},
	});

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Déclarer un versement hors système
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Pour un versement déjà encaissé par un autre biais. Simple
						traçabilité : aucun encaissement de caisse n'est créé ici. Pour un
						paiement réel, utilisez plutôt « Encaisser la caution ».
					</Dialog.Description>

					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<form.Field name="dateVersement">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Date de versement"
									type="date"
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
									placeholder="ex : 150000"
									inputMode="numeric"
									autoComplete="off"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>

						{caisseFermee ? (
							<div
								role="alert"
								className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
							>
								<AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
								<span>{globalError}</span>
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
										{isSubmitting ? "Déclaration…" : "Déclarer le versement"}
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
