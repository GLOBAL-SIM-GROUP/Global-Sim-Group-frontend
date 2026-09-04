import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { getErrorMessageForCode, toApiError } from "#/core/api";

import type { ContratResilie } from "../api/contrats";
import { useResilierContrat } from "../hooks/use-contrats";

interface ResilierContratFormDialogProps {
	open: boolean;
	idContrat: string;
	onOpenChange: (open: boolean) => void;
	onSaved: (resultat: ContratResilie) => void;
}

function dateAujourdhui(): string {
	return new Date().toISOString().slice(0, 10);
}

/**
 * Modale « Résilier le contrat » (POST `/contrats/{id}/resilier`) : départ
 * anticipé / résiliation à l'amiable, avant le terme du contrat. Date de
 * résiliation (défaut aujourd'hui, sert aussi au backend à calculer le
 * trop-perçu) et motif optionnels. Ne touche pas à la caution — flux
 * indépendant de `RestituerCautionFormDialog`.
 */
export function ResilierContratFormDialog({
	open,
	idContrat,
	onOpenChange,
	onSaved,
}: ResilierContratFormDialogProps) {
	const mutation = useResilierContrat();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			dateResiliation: dateAujourdhui(),
			motif: "",
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const resultat = await mutation.mutateAsync({
					id: idContrat,
					dateResiliation: value.dateResiliation,
					motif: value.motif.trim() ? value.motif.trim() : null,
				});
				onSaved(resultat);
			} catch (error) {
				const apiError = toApiError(error);
				setGlobalError(
					getErrorMessageForCode(apiError.code) ??
						(apiError.message || "Une erreur est survenue."),
				);
			}
		},
	});

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Résilier le contrat
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Met fin au contrat avant son terme et libère le logement
						immédiatement.
					</Dialog.Description>

					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<form.Field name="dateResiliation">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Date de résiliation"
									type="date"
									autoComplete="off"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>

						<form.Field name="motif">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Motif (optionnel)"
									placeholder="ex : Mutation professionnelle"
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
										onClick={() => onOpenChange(false)}
									>
										Annuler
									</Button>
									<Button
										type="submit"
										variant="destructive"
										disabled={isSubmitting}
									>
										{isSubmitting ? (
											<Loader2 className="size-4 animate-spin" aria-hidden />
										) : null}
										{isSubmitting ? "Résiliation…" : "Résilier"}
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
