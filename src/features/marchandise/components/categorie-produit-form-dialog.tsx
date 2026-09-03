import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { getErrorMessageForCode, toApiError } from "#/core/api";

import { useCreerCategorieProduit } from "../hooks/use-produits";

interface CategorieProduitFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Ajouter une catégorie de produit » (M3). Le backend n'expose aucun
 * endpoint de suppression/modification pour les catégories → ajout uniquement.
 */
export function CategorieProduitFormDialog({
	open,
	onOpenChange,
	onSaved,
}: CategorieProduitFormDialogProps) {
	const mutation = useCreerCategorieProduit();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { libelle: "" },
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.libelle.trim()) fields.libelle = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await mutation.mutateAsync({ libelle: value.libelle.trim() });
				onSaved();
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						(toApiError(error).message || "Une erreur est survenue."),
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
						Ajouter une catégorie de produit
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Nouvelle catégorie du catalogue (alimentation, boissons…).
					</Dialog.Description>

					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<form.Field name="libelle">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Libellé"
									placeholder="ex : Épicerie"
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
