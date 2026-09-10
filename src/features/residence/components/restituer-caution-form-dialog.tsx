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

import { useRestituerCaution } from "../hooks/use-contrats";

interface RestituerCautionFormDialogProps {
	open: boolean;
	idContrat: string;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Restituer la caution » (POST `/contrats/{id}/caution/restitution`).
 * Retenue et motif optionnels.
 */
export function RestituerCautionFormDialog({
	open,
	idContrat,
	onOpenChange,
	onSaved,
}: RestituerCautionFormDialogProps) {
	const mutation = useRestituerCaution();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [caisseFermee, setCaisseFermee] = useState(false);

	const form = useForm({
		defaultValues: { retenue: "", motifRetenue: "" },
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (value.retenue) {
					const erreur = validerMontant(value.retenue, "La retenue");
					if (erreur) fields.retenue = erreur;
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
					retenue: value.retenue.trim()
						? normaliserMontantPourBackend(value.retenue)
						: null,
					motif_retenue: value.motifRetenue.trim()
						? value.motifRetenue.trim()
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
						Restituer la caution
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Une retenue éventuelle est déduite du montant restitué.
					</Dialog.Description>

					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<form.Field name="retenue">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Retenue (FCFA, optionnelle)"
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

						<form.Field name="motifRetenue">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Motif de la retenue (optionnel)"
									placeholder="ex : Peinture à refaire"
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
										{isSubmitting ? "Restitution…" : "Restituer"}
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
