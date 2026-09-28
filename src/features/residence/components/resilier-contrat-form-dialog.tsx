import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { InputField } from "#/components/ui/input-field";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import type { ContratResilie } from "../api/contrats";
import { useResilierContrat } from "../hooks/use-contrats";
import { dateLocaleISO } from "../models/format";

interface ResilierContratFormDialogProps {
	open: boolean;
	idContrat: string;
	onOpenChange: (open: boolean) => void;
	onSaved: (resultat: ContratResilie) => void;
}

function dateAujourdhui(): string {
	return dateLocaleISO();
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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogTitle>Résilier le contrat</DialogTitle>
				<DialogDescription>
					Met fin au contrat avant son terme et libère le logement
					immédiatement.
				</DialogDescription>

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
			</DialogContent>
		</Dialog>
	);
}
