import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Switch } from "#/components/ui/switch";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { useActivites } from "#/features/rh/hooks/use-comptes";
import { useEmployes } from "#/features/rh/hooks/use-employes";
import { useRoles } from "../hooks/use-roles";
import {
	useCreerUtilisateur,
	useModifierUtilisateur,
} from "../hooks/use-utilisateurs";
import type { Utilisateur } from "../models/utilisateurs";

interface UtilisateurFormDialogProps {
	open: boolean;
	utilisateur: Utilisateur | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Ajouter / Modifier un utilisateur » (M11, 12.2) : login, mot de
 * passe (création), employé associé, rôle, activité scope (caissier), statut.
 */
export function UtilisateurFormDialog({
	open,
	utilisateur,
	onOpenChange,
	onSaved,
}: UtilisateurFormDialogProps) {
	const rolesQuery = useRoles();
	const employesQuery = useEmployes();
	const activitesQuery = useActivites(true);
	const createMutation = useCreerUtilisateur();
	const editMutation = useModifierUtilisateur();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const roles = rolesQuery.data ?? [];
	const employes = employesQuery.data ?? [];
	const activites = (activitesQuery.data ?? []).filter(
		(activite) => activite.actif,
	);

	const form = useForm({
		defaultValues: {
			login: utilisateur?.login ?? "",
			motDePasse: "",
			// La réponse GET n'expose pas `id_employe` → champ vide en édition.
			idEmploye: "",
			idRole: utilisateur?.id_role ?? "",
			idActiviteScope: utilisateur?.id_activite_scope ?? "",
			actif: utilisateur?.actif ?? true,
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.login.trim()) fields.login = "Ce champ est requis.";
				if (!utilisateur && value.motDePasse.trim().length < 6) {
					fields.motDePasse =
						"Le mot de passe doit contenir au moins 6 caractères.";
				}
				if (!value.idRole) fields.idRole = "Sélectionnez un rôle.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const corps = {
					login: value.login.trim(),
					idRole: value.idRole,
					idEmploye: value.idEmploye || null,
					idActiviteScope: value.idActiviteScope || null,
					actif: value.actif,
				};
				if (utilisateur) {
					await editMutation.mutateAsync({ id: utilisateur.id, ...corps });
				} else {
					await createMutation.mutateAsync({
						...corps,
						motDePasse: value.motDePasse,
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
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{utilisateur ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Compte d'accès à l'application et rôle attribué.
					</Dialog.Description>
					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<form.Field name="login">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Login (unique)"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>

						{!utilisateur ? (
							<form.Field name="motDePasse">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Mot de passe"
										type="password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
						) : null}

						<form.Field name="idEmploye">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>
										Employé associé (optionnel)
									</Label>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger
											id={field.name}
											aria-label="Employé associé"
											className="w-full"
										>
											<SelectValue placeholder="Aucun" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="">Aucun</SelectItem>
											{employes.map((employe) => (
												<SelectItem key={employe.id} value={employe.id}>
													{employe.prenom} {employe.nom} — {employe.fonction}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
						</form.Field>

						<form.Field name="idRole">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>Rôle</Label>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger
											id={field.name}
											aria-label="Rôle"
											className="w-full"
										>
											<SelectValue placeholder="Sélectionner un rôle" />
										</SelectTrigger>
										<SelectContent>
											{roles.map((role) => (
												<SelectItem key={role.id} value={role.id}>
													{role.libelle}
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

						<form.Field name="idActiviteScope">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>
										Activité (scope, pour les caissiers — optionnel)
									</Label>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger
											id={field.name}
											aria-label="Activité"
											className="w-full"
										>
											<SelectValue placeholder="Aucune" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="">Aucune</SelectItem>
											{activites.map((activite) => (
												<SelectItem key={activite.id} value={activite.id}>
													{activite.libelle}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
						</form.Field>

						<form.Field name="actif">
							{(field) => (
								<div className="flex items-center gap-3">
									<Label htmlFor={field.name}>Compte actif</Label>
									<Switch
										id={field.name}
										checked={field.state.value}
										onCheckedChange={field.handleChange}
									/>
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
