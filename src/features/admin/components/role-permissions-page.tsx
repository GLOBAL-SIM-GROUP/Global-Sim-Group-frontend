import { Link } from "@tanstack/react-router";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import {
	useMajRolePermissions,
	usePermissions,
	useRolePermissions,
	useRoles,
} from "../hooks/use-roles";

interface RolePermissionsPageProps {
	/** Id du rôle (paramètre `$id` de la route). */
	id: string;
}

/**
 * Page « Permissions — [Rôle] » (M11, 12.4) : matrice modules × actions
 * (cases à cocher), « tout cocher/décocher » par module et Enregistrer.
 */
export function RolePermissionsPage({ id }: RolePermissionsPageProps) {
	const canModifier = useCan("ADMIN.MODIFIER");
	const permissionsQuery = usePermissions();
	const rolePermissionsQuery = useRolePermissions(id);
	const rolesQuery = useRoles();
	const majMutation = useMajRolePermissions();

	const [cochees, setCochees] = useState<Set<string>>(new Set());
	const [saved, setSaved] = useState(false);

	// Préremplit les cases avec les permissions actuelles du rôle.
	useEffect(() => {
		if (rolePermissionsQuery.data) {
			setCochees(new Set(rolePermissionsQuery.data.map((p) => p.id)));
		}
	}, [rolePermissionsQuery.data]);

	const role = rolesQuery.data?.find((r) => r.id === id);
	const modules = new Map<string, typeof permissionsQuery.data>();
	for (const permission of permissionsQuery.data ?? []) {
		const module = permission.code.split(".")[0] ?? "";
		const liste = modules.get(module) ?? [];
		liste.push(permission);
		modules.set(module, liste);
	}

	const toutCocherModule = (ids: string[]) => {
		setSaved(false);
		setCochees((precedent) => {
			const suivant = new Set(precedent);
			const tousCoches = ids.every((p) => precedent.has(p));
			for (const p of ids) {
				if (tousCoches) suivant.delete(p);
				else suivant.add(p);
			}
			return suivant;
		});
	};

	const enregistrer = () => {
		setSaved(false);
		majMutation.mutate(
			{ id, idPermissions: [...cochees] },
			{ onSuccess: () => setSaved(true) },
		);
	};

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Rôles", to: "/admin/roles" },
					{ label: `Permissions — ${role?.libelle ?? id}` },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Permissions — {role?.libelle ?? id}
					</h1>
					<p className="text-muted-foreground">
						Attribuez les accès par module et action.
					</p>
				</section>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" asChild>
						<Link to="/admin/roles">Retour aux rôles</Link>
					</Button>
					{canModifier ? (
						<Button
							size="sm"
							onClick={enregistrer}
							disabled={majMutation.isPending}
						>
							{majMutation.isPending ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : (
								<Check className="size-4" aria-hidden />
							)}
							Enregistrer
						</Button>
					) : null}
				</div>
			</div>

			{saved ? (
				<output
					className={cn(
						"block rounded-md border px-4 py-2 text-sm",
						"border-[#27AE60]/40 bg-[#27AE60]/10 text-[#27AE60]",
					)}
				>
					Permissions enregistrées.
				</output>
			) : null}

			{permissionsQuery.isLoading || rolePermissionsQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : permissionsQuery.isError ? (
				<div
					role="alert"
					className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les permissions.</p>
				</div>
			) : (
				<div className="space-y-4">
					{[...modules.entries()].map(([module, permissions]) => {
						const perms = permissions ?? [];
						return (
							<section
								key={module}
								className="rounded-lg border border-border bg-card p-5 shadow-sm"
							>
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-semibold text-foreground">
										{module}
									</h2>
									<label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
										<input
											type="checkbox"
											checked={perms.every((p) => cochees.has(p.id))}
											onChange={() => toutCocherModule(perms.map((p) => p.id))}
										/>
										Tout cocher / décocher
									</label>
								</div>
								<div className="mt-3 grid gap-2 sm:grid-cols-2">
									{perms.map((permission) => {
										const verbe = permission.code.split(".")[1] ?? "";
										const cochee = cochees.has(permission.id);
										return (
											<label
												key={permission.id}
												className={cn(
													"flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors",
													cochee
														? "border-lagoon/40 bg-lagoon/10"
														: "border-border hover:bg-accent/40",
												)}
											>
												<input
													type="checkbox"
													checked={cochee}
													onChange={() =>
														setCochees((precedent) => {
															const suivant = new Set(precedent);
															if (suivant.has(permission.id))
																suivant.delete(permission.id);
															else suivant.add(permission.id);
															return suivant;
														})
													}
												/>
												<span className="min-w-0">
													<span className="block text-sm font-medium text-foreground">
														{verbe}
													</span>
													<span className="block truncate text-xs text-muted-foreground">
														{permission.libelle}
													</span>
												</span>
											</label>
										);
									})}
								</div>
							</section>
						);
					})}
				</div>
			)}
		</div>
	);
}
