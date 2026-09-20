import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { CataloguePage } from "#/features/salle-fete/components/catalogue-page";

/**
 * Catalogue des types de manifestation — Salle de fête. Lecture gated par
 * `SALLE_FETE.VOIR` ; les mutations sont gated côté page par
 * `SALLE_FETE.GERER_CATALOGUE`.
 */
export const Route = createFileRoute("/_authenticated/salle-fete/catalogue/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "SALLE_FETE.VOIR");
	},
	component: CataloguePage,
});
