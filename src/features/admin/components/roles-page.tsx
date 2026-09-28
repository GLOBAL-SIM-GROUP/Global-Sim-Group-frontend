import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Plus, Shield, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { InputField } from "#/components/ui/input-field";
import { PageHeader } from "#/components/ui/page-header";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
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
	onSaved: (role: Role) => void;
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
				const role = await createMutation.mutateAsync({
					code: value.code.trim(),
					libelle: value.libelle.trim(),
					description: value.description.trim() || null,
				});
				onSaved(role);
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
			<DialogContent className="max-w-md">
				<DialogTitle>Ajouter un rôle</DialogTitle>
				<DialogDescription>
					Vous choisirez ses permissions juste après.
				</DialogDescription>
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
			</DialogContent>
		</Dialog>
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
		<Tr>
			<Td>
				<div className="flex items-center gap-2 font-medium text-foreground">
					<Shield className="size-4 text-lagoon" aria-hidden />
					{role.libelle}
					<span className="text-xs font-normal text-muted-foreground">
						{role.code}
					</span>
				</div>
			</Td>
			<Td className="text-muted-foreground">{role.description ?? "—"}</Td>
			<Td className="text-right text-foreground">
				{permissionsQuery.data?.length ?? "…"}
			</Td>
			<Td className="text-right text-foreground">{nombreUtilisateurs}</Td>
			<Td>
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
			</Td>
		</Tr>
	);
}

/**
 * Page « Rôles » (M11, 12.3) : liste des rôles, nombre de permissions et
 * d'utilisateurs, Ajouter / Modifier les permissions / Supprimer.
 */
export function RolesPage() {
	const canCreer = useCan("ADMIN.CREER");
	const navigate = useNavigate();
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
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Rôles" }]}
				title="Rôles"
				description="Rôles de l'application et permissions associées."
				actions={
					canCreer ? (
						<Button onClick={() => setFormOuvert(true)}>
							<Plus className="size-4" aria-hidden />
							Ajouter un rôle
						</Button>
					) : undefined
				}
			/>

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
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>RÔLE</Th>
								<Th>DESCRIPTION</Th>
								<Th className="text-right">PERMISSIONS</Th>
								<Th className="text-right">UTILISATEURS</Th>
								<Th className="text-right">ACTIONS</Th>
							</tr>
						</DataTableHead>
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
					</DataTable>
				</TableShell>
			)}

			<CreerRoleDialog
				open={formOuvert}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={(role) => {
					setFormOuvert(false);
					// Enchaîne directement sur ses permissions — un rôle sans aucune
					// permission n'a aucun intérêt, autant guider l'admin jusque-là
					// plutôt que de le laisser retrouver le rôle dans la liste.
					void navigate({
						to: "/admin/roles/$id/permissions",
						params: { id: role.id },
					});
				}}
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
