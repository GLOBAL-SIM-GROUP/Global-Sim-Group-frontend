import { createFileRoute, Link } from "@tanstack/react-router";
import { Home } from "lucide-react";

import { ModuleTile } from "#/components/ui/module-tile";
import { useCurrentUser, usePermissions } from "#/core/auth";
import { getAccessibleModules } from "#/core/permissions/modules";

/**
 * Accueil protégé = lanceur de modules. Les tuiles sont pilotées par les
 * permissions réelles (`MODULE.VOIR`). Chaque tuile mène au placeholder
 * `/en-cours` tant que les routes métier n'existent pas.
 */
export const Route = createFileRoute("/_authenticated/")({
	component: HomePage,
});

function HomePage() {
	const user = useCurrentUser();
	const accessibleModules = getAccessibleModules(usePermissions());

	return (
		<div className="mx-auto w-full max-w-5xl space-y-8 p-6">
			<section className="space-y-1">
				<h1 className="text-2xl font-semibold">
					Bienvenue, {user?.login ?? ""} !
				</h1>
				<p className="text-muted-foreground">
					Sélectionnez un module pour commencer.
				</p>
			</section>

			{user?.role === "RESIDENT" ? (
				<Link
					to="/residence/portail"
					className="flex items-start gap-4 rounded-lg border border-border bg-card p-6 shadow-sm transition-colors hover:bg-accent/40"
				>
					<span className="grid size-10 shrink-0 place-items-center rounded-md bg-lagoon/15 text-lagoon">
						<Home className="size-5" aria-hidden />
					</span>
					<span>
						<span className="block text-lg font-semibold text-foreground">
							Mon espace résident
						</span>
						<span className="block text-sm text-muted-foreground">
							Suivi de votre loyer, de vos paiements et de votre caution.
						</span>
					</span>
				</Link>
			) : null}

			{accessibleModules.length > 0 ? (
				<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{accessibleModules.map((module) => (
						<ModuleTile
							key={module.code}
							icon={module.icon}
							title={module.title}
							description={module.description}
							linkProps={{
								to: "/en-cours",
								search: { module: module.code },
							}}
						/>
					))}
				</section>
			) : (
				<p className="text-sm text-muted-foreground">
					Aucun module accessible.
				</p>
			)}
		</div>
	);
}
