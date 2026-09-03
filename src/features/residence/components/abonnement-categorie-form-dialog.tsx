import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { getErrorMessageForCode, toApiError } from "#/core/api";

import {
	useCreerAbonnementCategorie,
	useModifierAbonnementCategorie,
} from "../hooks/use-abonnement-categories";
import type { AbonnementCategorie } from "../models/abonnement-categories";

interface AbonnementCategorieFormDialogProps {
	open: boolean;
	/** Catégorie à modifier (mode édition) ; null = création. */
	categorie: AbonnementCategorie | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Ajouter / Modifier une catégorie d'abonnement ». Même pattern que
 * `CategorieFormDialog` (charges). Le `key` (posé par l'appelant) remonte un
 * formulaire neuf à chaque ouverture.
 */
export function AbonnementCategorieFormDialog({
	open,
	categorie,
	onOpenChange,
	onSaved,
}: AbonnementCategorieFormDialogProps) {
	const createMutation = useCreerAbonnementCategorie();
	const editMutation = useModifierAbonnementCategorie();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			code: categorie?.code ?? "",
			libelle: categorie?.libelle ?? "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.code.trim()) fields.code = "Ce champ est requis.";
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
						code: value.code.trim(),
						libelle: value.libelle.trim(),
					});
				} else {
					await createMutation.mutateAsync({
						code: value.code.trim(),
						libelle: value.libelle.trim(),
					});
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
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{categorie ? "Modifier la catégorie" : "Ajouter une catégorie"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Catégorie d'abonnement configurable (Internet, eau, restaurant…).
					</Dialog.Description>

					<form
						className="mt-4 space-y-4"
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
									placeholder="ex : INTERNET"
									autoComplete="off"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>

						<form.Field name="libelle">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Libellé"
									placeholder="ex : Internet fibre"
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
