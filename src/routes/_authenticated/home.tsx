import { createFileRoute, Link } from "@tanstack/react-router";
import { Home } from "lucide-react";

import { ModuleTile } from "#/components/ui/module-tile";
import { useCurrentUser, usePermissions } from "#/core/auth";
import {
	getAccessibleModules,
	getAccessibleModuleSubItems,
} from "#/core/permissions/modules";

/**
 * Accueil protégé = lanceur de modules. Les tuiles sont pilotées par les
 * permissions réelles (`MODULE.VOIR`). Chaque tuile mène au placeholder
 * `/en-cours` tant que les routes métier n'existent pas.
 */
export const Route = createFileRoute("/_authenticated/home")({
	component: HomePage,
});

function HomePage() {
	const user = useCurrentUser();
	const accessibleModules = getAccessibleModules(usePermissions());

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
			<section className="space-y-1">
				<h1 className="text-xl sm:text-2xl font-semibold">
					Bienvenue, {user?.login ?? ""} !
				</h1>
				<p className="text-sm sm:text-base text-muted-foreground">
					Sélectionnez un module pour commencer.
				</p>
			</section>

			{user?.role === "RESIDENT" ? (
				<Link
					to="/residence/portail"
					className="flex items-start gap-3 sm:gap-4 rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm transition-colors hover:bg-accent/40"
				>
					<span className="grid size-9 sm:size-10 shrink-0 place-items-center rounded-md bg-lagoon/15 text-lagoon">
						<Home className="size-4 sm:size-5" aria-hidden />
					</span>
					<span className="min-w-0">
						<span className="block text-base sm:text-lg font-semibold text-foreground">
							Mon espace résident
						</span>
						<span className="block text-xs sm:text-sm text-muted-foreground">
							Suivi de votre loyer, de vos paiements et de votre caution.
						</span>
					</span>
				</Link>
			) : null}

			{accessibleModules.length > 0 ? (
				<section className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{accessibleModules.map((module) => {
						// Obtient la première sous-page accessible du module
						const subItems = getAccessibleModuleSubItems(
							module,
							usePermissions(),
						);
						// Pointe vers la première sous-page, ou le placeholder si aucune
						const href =
							subItems.length > 0
								? subItems[0].path
								: "/en-cours";
						const search =
							subItems.length === 0
								? { module: module.code }
								: undefined;

						return (
							<ModuleTile
								key={module.code}
								icon={module.icon}
								title={module.title}
								description={module.description}
								linkProps={
									search
										? {
												to: href,
												search,
											}
										: { to: href }
								}
							/>
						);
					})}
				</section>
			) : (
				<p className="text-sm text-muted-foreground">
					Aucun module accessible.
				</p>
			)}
		</div>
	);
}
