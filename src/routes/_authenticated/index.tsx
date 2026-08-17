import { createFileRoute } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { useCurrentUser, usePermissions } from "#/core/auth";
import { useHealthQuery } from "#/core/query";
import * as m from "#/paraglide/messages";

/**
 * Accueil protégé minimal (aucune fonctionnalité métier). Prouve le câblage
 * de la fondation : session + utilisateur courant, permissions réelles du
 * backend, et requête TanStack Query vers la santé du service.
 */
export const Route = createFileRoute("/_authenticated/")({
	component: HomePage,
});

function HomePage() {
	const user = useCurrentUser();
	const permissions = usePermissions();
	const health = useHealthQuery();

	return (
		<div className="mx-auto w-full max-w-3xl space-y-10 p-6">
			<section className="space-y-2">
				<h1 className="text-2xl font-semibold">{m.home_welcome()}</h1>
				<p className="text-muted-foreground">
					{user?.login} · {m.home_role_label()} : {user?.role ?? "—"}
				</p>
			</section>

			<section className="space-y-3">
				<h2 className="text-lg font-medium">{m.home_permissions_title()}</h2>
				{permissions.length > 0 ? (
					<ul className="flex flex-wrap gap-2">
						{permissions.map((permission) => (
							<li
								key={permission}
								className="rounded-md border bg-muted/50 px-2.5 py-1 font-mono text-xs"
							>
								{permission}
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-muted-foreground">
						{m.home_no_permissions()}
					</p>
				)}
			</section>

			<section className="space-y-3">
				<h2 className="text-lg font-medium">{m.home_health_title()}</h2>
				<div className="flex items-center gap-3">
					{health.isPending ? (
						<span className="text-sm text-muted-foreground">
							{m.common_loading()}
						</span>
					) : health.isError ? (
						<span className="text-sm font-medium text-destructive">
							{m.common_health_ko()}
						</span>
					) : (
						<span className="text-sm font-medium text-emerald-600">
							{m.common_health_ok()}
						</span>
					)}
					<Button
						variant="outline"
						size="sm"
						onClick={() => void health.refetch()}
						disabled={health.isFetching}
					>
						{m.common_retry()}
					</Button>
				</div>
			</section>
		</div>
	);
}
