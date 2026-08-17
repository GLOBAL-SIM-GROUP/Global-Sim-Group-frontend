import { createFileRoute } from "@tanstack/react-router";
import { ModuleTile } from "#/components/ui/module-tile";
import { useCurrentUser, usePermissions } from "#/core/auth";
import { getAccessibleModules } from "#/core/permissions/modules";
import * as m from "#/paraglide/messages";

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
					{m.home_welcome_name({ name: user?.login ?? "" })}
				</h1>
				<p className="text-muted-foreground">
					{m.home_subtitle_select_module()}
				</p>
			</section>

			{accessibleModules.length > 0 ? (
				<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{accessibleModules.map((module) => (
						<ModuleTile
							key={module.code}
							icon={module.icon}
							title={module.title()}
							description={module.description()}
							linkProps={{
								to: "/en-cours",
								search: { module: module.code },
							}}
						/>
					))}
				</section>
			) : (
				<p className="text-sm text-muted-foreground">{m.home_no_modules()}</p>
			)}
		</div>
	);
}
