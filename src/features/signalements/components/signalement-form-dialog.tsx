import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import { getErrorMessageForCode, toApiError } from "#/core/api";

import { useCreerSignalement } from "../hooks/use-signalements";

interface SignalementFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Appelé avec l'id du signalement créé (navigation vers la fiche). */
	onCreated: (idSignalement: string) => void;
}

/**
 * Modale « Nouveau signalement » — même pattern que les autres formulaires
 * de création de l'app (`FactureFormDialog`, `ClientFormDialog`) : modale
 * plutôt que page dédiée.
 */
export function SignalementFormDialog({
	open,
	onOpenChange,
	onCreated,
}: SignalementFormDialogProps) {
	const creerMutation = useCreerSignalement();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { titre: "", description: "" },
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.titre.trim()) fields.titre = "Ce champ est requis.";
				if (!value.description.trim()) {
					fields.description = "Ce champ est requis.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const signalement = await creerMutation.mutateAsync({
					titre: value.titre.trim(),
					description: value.description.trim(),
				});
				form.reset();
				onCreated(signalement.id);
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						"Une erreur est survenue.",
				);
			}
		},
	});

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(next) => {
				if (!next) form.reset();
				onOpenChange(next);
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Nouveau signalement
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Décrivez le problème ou le signalement.
					</Dialog.Description>
					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<form.Field name="titre">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Titre"
									placeholder="Résumé du problème"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>

						<form.Field name="description">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>Description</Label>
									<textarea
										id={field.name}
										name={field.name}
										className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
										placeholder="Décrivez le problème en détail"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
									{field.state.meta.errors[0] ? (
										<p className="text-xs text-destructive">
											{field.state.meta.errors[0]}
										</p>
									) : null}
								</div>
							)}
						</form.Field>

						{globalError ? (
							<p role="alert" className="text-sm font-medium text-destructive">
								{globalError}
							</p>
						) : null}

						<div className="flex items-center justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="ghost"
								onClick={() => onOpenChange(false)}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={creerMutation.isPending}>
								{creerMutation.isPending ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : null}
								Créer le signalement
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
