import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { getErrorMessageForCode, toApiError } from "#/core/api";

import { useCreerClient } from "../hooks/use-clients";

interface ClientSimpleFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Ajouter un client » (3.1, création rapide, type `PASSAGE`) : le
 * strict nécessaire pour identifier un client de passage et lui associer une
 * commande (pressing, restaurant, boutique) — nom, prénoms (optionnel),
 * téléphone. Volontairement sans date de naissance, pièce d'identité,
 * adresse, etc. : ces champs ne servent pas à passer une commande et
 * alourdiraient la saisie au comptoir. Pour un résident locataire (dossier
 * complet), voir « Ajouter un locataire ».
 */
export function ClientSimpleFormDialog({
	open,
	onOpenChange,
	onSaved,
}: ClientSimpleFormDialogProps) {
	const createMutation = useCreerClient();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { nom: "", prenoms: "", telPrincipal: "" },
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.nom.trim()) fields.nom = "Ce champ est requis.";
				if (!value.telPrincipal.trim())
					fields.telPrincipal = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await createMutation.mutateAsync({
					nom: value.nom.trim(),
					prenoms: value.prenoms.trim(),
					telPrincipal: value.telPrincipal.trim(),
					typeClient: "PASSAGE",
				});
				form.reset();
				onSaved();
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
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Nouveau client
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Client de passage — pour passer une commande au pressing, au
						restaurant ou à la boutique.
					</Dialog.Description>

					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<form.Field name="nom">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Nom"
									autoComplete="off"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>

						<form.Field name="prenoms">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Prénom(s) (optionnel)"
									autoComplete="off"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>

						<form.Field name="telPrincipal">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Téléphone"
									placeholder="ex : +2250700000000"
									inputMode="tel"
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

						<div className="flex items-center justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="ghost"
								disabled={createMutation.isPending}
								onClick={() => onOpenChange(false)}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={createMutation.isPending}>
								{createMutation.isPending ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : null}
								Enregistrer
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
