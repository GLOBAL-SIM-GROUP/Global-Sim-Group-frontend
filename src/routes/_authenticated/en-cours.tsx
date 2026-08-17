import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { MODULE_DEFINITIONS } from "#/core/permissions/modules";
import * as m from "#/paraglide/messages";

/**
 * Placeholder partagé des modules non construits : les tuiles, la sidebar et
 * ses sous-menus y mènent (avec le code du module et éventuellement la page en
 * paramètres d'URL). À supprimer quand les routes métier de chaque module
 * existeront.
 */
export const Route = createFileRoute("/_authenticated/en-cours")({
	validateSearch: z.object({
		module: z.string().optional(),
		page: z.string().optional(),
	}),
	component: ComingSoonPage,
});

function ComingSoonPage() {
	const { module, page } = Route.useSearch();
	const def = MODULE_DEFINITIONS.find((item) => item.code === module);
	const sub = def?.subItems?.find((item) => item.id === page);

	const title = def
		? sub
			? `${def.title()} — ${sub.label()} — ${m.home_module_pending()}`
			: `${def.title()} — ${m.home_module_pending()}`
		: m.home_module_pending();

	return (
		<div className="mx-auto w-full max-w-5xl space-y-4 p-6">
			<h1 className="text-2xl font-semibold">{title}</h1>
			<Link to="/" className="text-sm text-muted-foreground underline">
				{m.common_back_home()}
			</Link>
		</div>
	);
}
