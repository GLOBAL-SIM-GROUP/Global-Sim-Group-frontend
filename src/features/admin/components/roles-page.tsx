import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { Loader2, Plus, Shield, Trash2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { ConfirmDialog } from "#/features/residence/components/confirm-dialog";

import {
	useCreerRole,
	useRolePermissions,
	useRoles,
	useSupprimerRole,
} from "../hooks/use-roles";
import { useUtilisateurs } from "../hooks/use-utilisateurs";
import type { Role } from "../models/roles";

/** Modale « Ajouter un rôle ». */
function CreerRoleDialog({
	open,
	onOpenChange,
	onSaved,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}) {
	const createMutation = useCreerRole();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const form = useForm({
		defaultValues: { code: "", libelle: "", description: "" },
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
				await createMutation.mutateAsync({
					code: value.code.trim(),
					libelle: value.libelle.trim(),
					description: value.description.trim() || null,
				});
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
						Ajouter un rôle
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Nouveau rôle avec ses permissions.
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
									label="Code (ex. RESPONSABLE_X)"
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
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						<form.Field name="description">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Description"
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

/** Ligne rôle : compte ses propres permissions (hook dédié, pas de boucle). */
function LigneRole({
	role,
	utilisateursParRole,
	onSupprimer,
}: {
	role: Role;
	utilisateursParRole: ReadonlyMap<string, number>;
	onSupprimer: (role: Role) => void;
}) {
	const canSupprimer = useCan("ADMIN.SUPPRIMER");
	const permissionsQuery = useRolePermissions(role.id);
	const nombreUtilisateurs = utilisateursParRole.get(role.id) ?? 0;

	return (
		<tr className="border-t border-border transition-colors hover:bg-accent/40">
			<td className="px-4 py-3">
				<div className="flex items-center gap-2 font-medium text-foreground">
					<Shield className="size-4 text-lagoon" aria-hidden />
					{role.libelle}
					<span className="text-xs font-normal text-muted-foreground">
						{role.code}
					</span>
				</div>
			</td>
			<td className="px-4 py-3 text-muted-foreground">
				{role.description ?? "—"}
			</td>
			<td className="px-4 py-3 text-right text-foreground">
				{permissionsQuery.data?.length ?? "…"}
			</td>
			<td className="px-4 py-3 text-right text-foreground">
				{nombreUtilisateurs}
			</td>
			<td className="px-4 py-3">
				<div className="flex items-center justify-end gap-1">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/admin/roles/$id/permissions" params={{ id: role.id }}>
							Modifier les permissions
						</Link>
					</Button>
					{canSupprimer && nombreUtilisateurs === 0 ? (
						<Button
							variant="ghost"
							size="icon-sm"
							title="Supprimer"
							className="text-destructive"
							onClick={() => onSupprimer(role)}
						>
							<Trash2 className="size-4" aria-hidden />
							<span className="sr-only">Supprimer</span>
						</Button>
					) : null}
				</div>
			</td>
		</tr>
	);
}

/**
 * Page « Rôles » (M11, 12.3) : liste des rôles, nombre de permissions et
 * d'utilisateurs, Ajouter / Modifier les permissions / Supprimer.
 */
export function RolesPage() {
	const canCreer = useCan("ADMIN.CREER");
	const rolesQuery = useRoles();
	const utilisateursQuery = useUtilisateurs();
	const supprimerMutation = useSupprimerRole();

	const [formOuvert, setFormOuvert] = useState(false);
	const [aSupprimer, setASupprimer] = useState<Role | null>(null);

	const utilisateursParRole = useMemo(() => {
		const compteur = new Map<string, number>();
		for (const utilisateur of utilisateursQuery.data ?? []) {
			if (!utilisateur.id_role) continue;
			compteur.set(
				utilisateur.id_role,
				(compteur.get(utilisateur.id_role) ?? 0) + 1,
			);
		}
		return compteur;
	}, [utilisateursQuery.data]);

	const roles = rolesQuery.data ?? [];

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Rôles" }]} />

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">Rôles</h1>
					<p className="text-muted-foreground">
						Rôles de l'application et permissions associées.
					</p>
				</section>
				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Ajouter un rôle
					</Button>
				) : null}
			</div>

			{rolesQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : rolesQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les rôles.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void rolesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									RÔLE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									DESCRIPTION
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									PERMISSIONS
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									UTILISATEURS
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									ACTIONS
								</th>
							</tr>
						</thead>
						<tbody>
							{roles.map((role) => (
								<LigneRole
									key={role.id}
									role={role}
									utilisateursParRole={utilisateursParRole}
									onSupprimer={setASupprimer}
								/>
							))}
						</tbody>
					</table>
				</div>
			)}

			<CreerRoleDialog
				open={formOuvert}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={() => setFormOuvert(false)}
			/>

			<ConfirmDialog
				open={aSupprimer !== null}
				onOpenChange={(ouvert) => {
					if (!ouvert) setASupprimer(null);
				}}
				title="Supprimer le rôle"
				message={`Voulez-vous vraiment supprimer le rôle « ${aSupprimer?.libelle ?? ""} » ?`}
				confirmLabel="Supprimer"
				cancelLabel="Annuler"
				destructive
				busy={supprimerMutation.isPending}
				onConfirm={() => {
					if (aSupprimer) {
						supprimerMutation.mutate(aSupprimer.id, {
							onSettled: () => setASupprimer(null),
						});
					}
				}}
			/>
		</div>
	);
}
