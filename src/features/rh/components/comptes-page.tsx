import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
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
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import {
	useActivites,
	useCreerUtilisateur,
	useRoles,
} from "../hooks/use-comptes";
import { useEmployes } from "../hooks/use-employes";

/**
 * Page « Comptes utilisateurs » (M9.4) : créer un compte (login/mot de passe,
 * rôle, éventuel scope caissier) pour un employé sans compte.
 */
export function ComptesPage() {
	const canVoir = useCan("RH.VOIR");
	const canAdminVoir = useCan("ADMIN.VOIR");
	const canAdminCreer = useCan("ADMIN.CREER");

	const employesQuery = useEmployes(true);
	const rolesQuery = useRoles(canAdminVoir);
	const activitesQuery = useActivites(canAdminVoir);
	const creerMutation = useCreerUtilisateur();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const employes = employesQuery.data ?? [];
	const roles = rolesQuery.data ?? [];
	const activites = (activitesQuery.data ?? []).filter(
		(activite) => activite.actif,
	);

	const form = useForm({
		defaultValues: {
			idEmploye: "",
			login: "",
			motDePasse: "",
			idRole: "",
			idActiviteScope: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.idEmploye) fields.idEmploye = "Sélectionnez un employé.";
				if (!value.login.trim()) fields.login = "Ce champ est requis.";
				if (value.motDePasse.trim().length < 6) {
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
				await creerMutation.mutateAsync({
					login: value.login.trim(),
					motDePasse: value.motDePasse,
					idRole: value.idRole,
					idEmploye: value.idEmploye,
					idActiviteScope: value.idActiviteScope || null,
				});
				form.reset();
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						"Une erreur est survenue.",
				);
			}
		},
	});

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès aux comptes utilisateurs.
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Comptes utilisateurs" },
				]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Créer un compte utilisateur
				</h1>
				<p className="text-muted-foreground">
					Permet à un employé d'accéder à l'application (pointage, consultation,
					etc.).
				</p>
			</section>

			{!canAdminCreer ? (
				<div
					role="alert"
					className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>
						Vous n'avez pas la permission de créer des comptes utilisateurs.
					</p>
				</div>
			) : (
				<form
					className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<form.Field name="idEmploye">
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>Employé (sans compte)</Label>
								<Select
									value={field.state.value}
									onValueChange={(valeur) => {
										field.handleChange(valeur);
										const employe = employes.find((e) => e.id === valeur);
										if (employe && !form.state.values.login) {
											form.setFieldValue(
												"login",
												`${employe.prenom}.${employe.nom}`.toLowerCase(),
											);
										}
									}}
								>
									<SelectTrigger
										id={field.name}
										aria-label="Employé"
										className="w-full"
									>
										<SelectValue placeholder="Sélectionner un employé" />
									</SelectTrigger>
									<SelectContent>
										{employes.map((employe) => (
											<SelectItem key={employe.id} value={employe.id}>
												{employe.prenom} {employe.nom} — {employe.fonction}
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

					{globalError ? (
						<p role="alert" className="text-sm font-medium text-destructive">
							{globalError}
						</p>
					) : null}

					{creerMutation.isSuccess ? (
						<output
							className={cn(
								"block rounded-md border px-4 py-2 text-sm",
								"border-[#27AE60]/40 bg-[#27AE60]/10 text-[#27AE60]",
							)}
						>
							Compte utilisateur créé avec succès.
						</output>
					) : null}

					<div className="flex items-center justify-end gap-2 pt-2">
						<Button type="submit" disabled={creerMutation.isPending}>
							{creerMutation.isPending ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							Enregistrer
						</Button>
					</div>
				</form>
			)}
		</div>
	);
}
