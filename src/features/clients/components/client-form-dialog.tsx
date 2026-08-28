import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { getErrorMessageForCode, toApiError } from "#/core/api";

import { useCreerClient, useModifierClient } from "../hooks/use-clients";
import type { Client, TypeClient } from "../models/clients";
import { TYPE_CLIENT_LABELS } from "../models/clients";

const TYPES: TypeClient[] = ["AUTRE"];

interface ClientFormDialogProps {
	open: boolean;
	client: Client | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Ajouter / Modifier un client » (3.1) : informations personnelles,
 * coordonnées et type de client.
 */
export function ClientFormDialog({
	open,
	client,
	onOpenChange,
	onSaved,
}: ClientFormDialogProps) {
	const createMutation = useCreerClient();
	const editMutation = useModifierClient();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			nom: client?.nom ?? "",
			prenoms: client?.prenoms ?? "",
			typeClient: client?.type_client ?? "",
			dateNaissance: client?.date_naissance ?? "",
			lieuNaissance: client?.lieu_naissance ?? "",
			sexe: client?.sexe ?? "",
			nationalite: client?.nationalite ?? "",
			profession: client?.profession ?? "",
			telPrincipal: client?.tel_principal ?? "",
			telSecondaire: client?.tel_secondaire ?? "",
			email: client?.email ?? "",
			adresse: client?.adresse ?? "",
			ville: client?.ville ?? "",
			pays: client?.pays ?? "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.nom.trim()) fields.nom = "Ce champ est requis.";
				if (!value.prenoms.trim()) fields.prenoms = "Ce champ est requis.";
				if (!value.telPrincipal.trim())
					fields.telPrincipal = "Ce champ est requis.";
				if (!value.typeClient) fields.typeClient = "Sélectionnez un type.";
				if (!value.dateNaissance) fields.dateNaissance = "Ce champ est requis.";
				if (!value.lieuNaissance.trim()) fields.lieuNaissance = "Ce champ est requis.";
				if (!value.sexe) fields.sexe = "Sélectionnez une option.";
				if (!value.nationalite.trim()) fields.nationalite = "Ce champ est requis.";
				if (!value.profession.trim()) fields.profession = "Ce champ est requis.";
				if (!value.telSecondaire.trim()) fields.telSecondaire = "Ce champ est requis.";
				if (!value.email.trim()) fields.email = "Ce champ est requis.";
				if (!value.adresse.trim()) fields.adresse = "Ce champ est requis.";
				if (!value.ville.trim()) fields.ville = "Ce champ est requis.";
				if (!value.pays.trim()) fields.pays = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const corps = {
					nom: value.nom.trim(),
					prenoms: value.prenoms.trim(),
					telPrincipal: value.telPrincipal.trim(),
					typeClient: value.typeClient as TypeClient,
					dateNaissance: value.dateNaissance || null,
					lieuNaissance: value.lieuNaissance.trim() || null,
					sexe: value.sexe || null,
					nationalite: value.nationalite.trim() || null,
					profession: value.profession.trim() || null,
					telSecondaire: value.telSecondaire.trim() || null,
					email: value.email.trim() || null,
					adresse: value.adresse.trim() || null,
					ville: value.ville.trim() || null,
					pays: value.pays.trim() || null,
				};
				if (client) {
					await editMutation.mutateAsync({ id: client.id, ...corps });
				} else {
					await createMutation.mutateAsync(corps);
				}
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
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{client ? "Modifier le client" : "Ajouter un client"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Fiche d'un locataire ou client de passage.
					</Dialog.Description>
					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<div className="grid grid-cols-2 gap-4">
							<form.Field name="nom">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Nom"
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
										label="Prénom(s)"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<form.Field name="typeClient">
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>Type de client</Label>
										<Select
											value={field.state.value}
											onValueChange={field.handleChange}
										>
											<SelectTrigger
												id={field.name}
												aria-label="Type de client"
												className="w-full"
											>
												<SelectValue placeholder="Sélectionner" />
											</SelectTrigger>
											<SelectContent>
												{TYPES.map((type) => (
													<SelectItem key={type} value={type}>
														{TYPE_CLIENT_LABELS[type]}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{field.state.meta.errors[0] ? (
											<p className="text-xs text-destructive">
												{field.state.meta.errors[0]}
											</p>
										) : null}
									</div>
								)}
							</form.Field>
							<form.Field name="telPrincipal">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Téléphone principal"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<form.Field name="dateNaissance">
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>Date de naissance</Label>
										<Input
											id={field.name}
											name={field.name}
											type="date"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											aria-invalid={field.state.meta.errors.length > 0}
										/>
										{field.state.meta.errors[0] ? (
											<p className="text-xs text-destructive">
												{field.state.meta.errors[0]}
											</p>
										) : null}
									</div>
								)}
							</form.Field>
							<form.Field name="lieuNaissance">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Lieu de naissance"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<form.Field name="sexe">
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>Sexe</Label>
										<Select
											value={field.state.value}
											onValueChange={field.handleChange}
										>
											<SelectTrigger
												id={field.name}
												aria-label="Sexe"
												className="w-full"
											>
												<SelectValue placeholder="—" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="M">Masculin</SelectItem>
												<SelectItem value="F">Féminin</SelectItem>
												<SelectItem value="AUTRE">Autre</SelectItem>
											</SelectContent>
										</Select>
										{field.state.meta.errors[0] ? (
											<p className="text-xs text-destructive">
												{field.state.meta.errors[0]}
											</p>
										) : null}
									</div>
								)}
							</form.Field>
							<form.Field name="nationalite">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Nationalité"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
						</div>

						<form.Field name="profession">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Profession / activité"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>

						<div className="grid grid-cols-2 gap-4">
							<form.Field name="telSecondaire">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Téléphone secondaire"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
							<form.Field name="email">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Adresse e-mail"
										type="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<form.Field name="adresse">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Adresse habituelle"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
							<div className="grid grid-cols-2 gap-4">
								<form.Field name="ville">
									{(field) => (
										<InputField
											id={field.name}
											name={field.name}
											label="Ville"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											error={field.state.meta.errors[0]}
										/>
									)}
								</form.Field>
								<form.Field name="pays">
									{(field) => (
										<InputField
											id={field.name}
											name={field.name}
											label="Pays"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											error={field.state.meta.errors[0]}
										/>
									)}
								</form.Field>
							</div>
						</div>

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
							<Button
								type="submit"
								disabled={createMutation.isPending || editMutation.isPending}
							>
								{createMutation.isPending || editMutation.isPending ? (
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
