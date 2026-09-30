import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
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
import { useMesCaisses } from "#/features/finances/hooks/use-mes-caisses";
import { ClientRechercheField } from "#/features/residence/components/client-recherche-field";
import { useActivites } from "#/features/rh/hooks/use-comptes";
import { useEmployes } from "#/features/rh/hooks/use-employes";
import { useRoles } from "../hooks/use-roles";
import {
	useCreerUtilisateur,
	useModifierUtilisateur,
	useUtilisateurs,
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
	const employesQuery = useEmployes({ sansCompte: true });
	const activitesQuery = useActivites(true);
	const caissesQuery = useMesCaisses();
	const utilisateursQuery = useUtilisateurs();
	const createMutation = useCreerUtilisateur();
	const editMutation = useModifierUtilisateur();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const roles = (rolesQuery.data ?? [])
		.slice()
		.sort((a, b) => a.libelle.localeCompare(b.libelle));
	const employes = employesQuery.data ?? [];
	const activites = (activitesQuery.data ?? []).filter(
		(activite) => activite.actif,
	);
	const caisses = (caissesQuery.data ?? []).filter((caisse) => caisse.actif);

	// IDs des clients déjà associés à un compte utilisateur (pour exclure
	// les résultats de recherche). En édition, on conserve le client
	// actuellement associé à cet utilisateur.
	const clientIdsAssocies = useMemo(() => {
		const ids = new Set<string>();
		for (const u of utilisateursQuery.data ?? []) {
			if (u.id_client && (!utilisateur || u.id !== utilisateur.id)) {
				ids.add(u.id_client);
			}
		}
		return ids;
	}, [utilisateursQuery.data, utilisateur]);

	const form = useForm({
		defaultValues: {
			login: utilisateur?.login ?? "",
			motDePasse: "",
			// La réponse GET n'expose pas `id_employe` → champ vide en édition
			// (même limite pour `idClient`, qui n'a qu'un id sans nom affichable).
			idEmploye: "",
			idClient: "",
			idRole: utilisateur?.id_role ?? "",
			idActiviteScope: utilisateur?.id_activite_scope ?? "",
			idCaisse: utilisateur?.id_caisse ?? "",
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
				const roleSelectionne = roles.find((r) => r.id === value.idRole);
				const estRoleCaisse = roleSelectionne
					? /caiss/i.test(roleSelectionne.code) ||
						/caiss/i.test(roleSelectionne.libelle)
					: false;
				if (estRoleCaisse && !value.idActiviteScope) {
					fields.idActiviteScope =
						"L'activité (scope) est obligatoire pour un rôle de caisse.";
				}
				if (estRoleCaisse && !value.idCaisse) {
					fields.idCaisse =
						"La caisse rattachée est obligatoire pour un rôle de caisse.";
				}
				const caisseChoisie = value.idCaisse
					? caisses.find((caisse) => caisse.id_caisse === value.idCaisse)
					: undefined;
				if (
					caisseChoisie &&
					value.idActiviteScope &&
					caisseChoisie.id_activite !== value.idActiviteScope
				) {
					fields.idCaisse =
						"La caisse choisie n'appartient pas à l'activité scopée.";
				}
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
					idClient: value.idClient || null,
					idActiviteScope: value.idActiviteScope || null,
					idCaisse: value.idCaisse || null,
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
				const apiError = toApiError(error);
				const message = apiError.message ?? "";

				// Contraintes d'unicité PostgreSQL — le backend renvoie le message
				// brut (ex. « Key (id_employe)=(7) already exists »). On le traduit
				// en un message clair pour l'utilisateur.
				if (/Key \(id_employe\)=.*already exists/i.test(message)) {
					setGlobalError(
						"Cet employé est déjà associé à un autre compte utilisateur.",
					);
				} else if (/Key \(id_client\)=.*already exists/i.test(message)) {
					setGlobalError(
						"Ce client est déjà associé à un autre compte utilisateur.",
					);
				} else if (/Key \(login\)=.*already exists/i.test(message)) {
					setGlobalError("Ce login est déjà utilisé. Choisissez-en un autre.");
				} else {
					setGlobalError(
						getErrorMessageForCode(apiError.code) ??
							(message || "Une erreur est survenue."),
					);
				}
			}
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-lg overflow-y-auto">
				<DialogTitle>
					{utilisateur ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
				</DialogTitle>
				<DialogDescription>
					Compte d'accès à l'application et rôle attribué.
				</DialogDescription>
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

					{/*
							Employé et client/locataire sont mutuellement exclusifs : un
							compte représente soit un membre du personnel, soit un
							client/résident, jamais les deux à la fois. Choisir l'un
							efface et désactive l'autre.
						*/}
					<form.Field name="idEmploye">
						{(field) => (
							<form.Subscribe selector={(state) => state.values.idClient}>
								{(idClient) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>
											Employé associé (optionnel)
										</Label>
										<Select
											value={field.state.value}
											onValueChange={(valeur) => {
												field.handleChange(valeur);
												if (valeur) form.setFieldValue("idClient", "");
											}}
											disabled={!!idClient}
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
										{idClient ? (
											<p className="text-xs text-muted-foreground">
												Un client/locataire est déjà associé — retirez-le pour
												choisir un employé.
											</p>
										) : null}
									</div>
								)}
							</form.Subscribe>
						)}
					</form.Field>

					<form.Field name="idClient">
						{(field) => (
							<form.Subscribe selector={(state) => state.values.idEmploye}>
								{(idEmploye) =>
									idEmploye ? (
										<div className="space-y-1.5">
											<Label>Client / locataire associé (optionnel)</Label>
											<p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
												Un employé est déjà associé — retirez-le pour choisir un
												client/locataire.
											</p>
										</div>
									) : (
										<ClientRechercheField
											value={field.state.value}
											onChange={(id) => {
												field.handleChange(id);
												if (id) form.setFieldValue("idEmploye", "");
											}}
											excludeIds={clientIdsAssocies}
										/>
									)
								}
							</form.Subscribe>
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
								{utilisateur && field.state.value !== utilisateur.id_role ? (
									<p className="text-xs text-muted-foreground">
										Changer le rôle remplace entièrement les permissions
										actuelles de ce compte par celles du nouveau rôle — ce n'est
										pas cumulatif.
									</p>
								) : null}
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
							<form.Subscribe selector={(state) => state.values.idRole}>
								{(idRole) => {
									const roleSelectionne = roles.find((r) => r.id === idRole);
									const estRoleCaisse = roleSelectionne
										? /caiss/i.test(roleSelectionne.code) ||
											/caiss/i.test(roleSelectionne.libelle)
										: false;
									return (
										<div className="space-y-1.5">
											<Label htmlFor={field.name}>
												Activité (scope
												{estRoleCaisse
													? " — obligatoire pour les caissiers"
													: ", pour les caissiers — optionnel"}
												)
											</Label>
											<Select
												value={field.state.value}
												onValueChange={(valeur) => {
													field.handleChange(valeur);
													const caisseChoisie = caisses.find(
														(caisse) =>
															caisse.id_caisse ===
															form.getFieldValue("idCaisse"),
													);
													if (
														caisseChoisie &&
														valeur &&
														caisseChoisie.id_activite !== valeur
													) {
														form.setFieldValue("idCaisse", "");
													}
												}}
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
											{field.state.meta.errors[0] ? (
												<p className="text-xs text-destructive">
													{field.state.meta.errors[0]}
												</p>
											) : null}
										</div>
									);
								}}
							</form.Subscribe>
						)}
					</form.Field>

					<form.Field name="idCaisse">
						{(field) => (
							<form.Subscribe
								selector={(state) => [
									state.values.idRole,
									state.values.idActiviteScope,
								]}
							>
								{([idRole, scope]) => {
									const roleSelectionne = roles.find((r) => r.id === idRole);
									const estRoleCaisse = roleSelectionne
										? /caiss/i.test(roleSelectionne.code) ||
											/caiss/i.test(roleSelectionne.libelle)
										: false;
									return (
										<div className="space-y-1.5">
											<Label htmlFor={field.name}>
												Caisse rattachée
												{estRoleCaisse
													? " — obligatoire pour les caissiers"
													: " (optionnel)"}
											</Label>
											<Select
												value={field.state.value}
												onValueChange={(valeur) => {
													field.handleChange(valeur);
													const caisse = caisses.find(
														(c) => c.id_caisse === valeur,
													);
													if (caisse && !scope) {
														form.setFieldValue(
															"idActiviteScope",
															caisse.id_activite,
														);
													}
												}}
											>
												<SelectTrigger
													id={field.name}
													aria-label="Caisse rattachée"
													className="w-full"
												>
													<SelectValue placeholder="Aucune" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="">Aucune</SelectItem>
													{caisses.map((caisse) => (
														<SelectItem
															key={caisse.id_caisse}
															value={caisse.id_caisse}
														>
															{caisse.libelle}
															{caisse.activite_libelle
																? ` — ${caisse.activite_libelle}`
																: ""}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{caisses.length === 0 ? (
												<p className="text-xs text-muted-foreground">
													Aucune caisse active visible (droits Finances requis).
												</p>
											) : null}
											{field.state.meta.errors[0] ? (
												<p className="text-xs text-destructive">
													{field.state.meta.errors[0]}
												</p>
											) : null}
										</div>
									);
								}}
							</form.Subscribe>
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
			</DialogContent>
		</Dialog>
	);
}
