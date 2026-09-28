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

import {
	useCreerCategorieCharge,
	useModifierCategorieCharge,
} from "../hooks/use-charges";
import type { CategorieCharge } from "../models/charges";

interface CategorieFormDialogProps {
	open: boolean;
	/** Catégorie à modifier (mode édition) ; null = création. */
	categorie: CategorieCharge | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Ajouter / Modifier une catégorie de charge » (M2.4). Le `key`
 * remonte un formulaire neuf à chaque ouverture.
 */
export function CategorieFormDialog({
	open,
	categorie,
	onOpenChange,
	onSaved,
}: CategorieFormDialogProps) {
	const createMutation = useCreerCategorieCharge();
	const editMutation = useModifierCategorieCharge();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { libelle: categorie?.libelle ?? "" },
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
				if (categorie) {
					await editMutation.mutateAsync({
						id: categorie.id,
						libelle: value.libelle.trim(),
					});
				} else {
					await createMutation.mutateAsync({ libelle: value.libelle.trim() });
				}
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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogTitle>
					{categorie ? "Modifier la catégorie" : "Ajouter une catégorie"}
				</DialogTitle>
				<DialogDescription>
					Catégorie de charge configurable (électricité, eau, autres…).
				</DialogDescription>

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
								placeholder="ex : Électricité"
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
			</DialogContent>
		</Dialog>
	);
}
