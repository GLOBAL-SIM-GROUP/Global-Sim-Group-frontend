import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { CataloguePage } from "#/features/pressing/components/catalogue-page";

/**
 * Catalogue Pressing — types de vêtement + prestations. Lecture gated par
 * `PRESSING.VOIR` ; les mutations (ajout / renommage / bascule `actif`)
 * exigent `PRESSING.GERER_CATALOGUE` — vérifiées par le backend et masquées
 * côté UI via `useCan`.
 */
export const Route = createFileRoute("/_authenticated/pressing/catalogue/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PRESSING.VOIR");
	},
	component: CataloguePage,
});
