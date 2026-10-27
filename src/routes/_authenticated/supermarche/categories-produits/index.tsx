import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { CategoriesProduitsPage } from "#/features/supermarche/components/categories-produits-page";

/**
 * Catégories de produits — Super-Marché. Pas de search param. Page gated par
 * `MARCHANDISE.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/supermarche/categories-produits/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "MARCHANDISE.VOIR");
	},
	component: CategoriesProduitsRoutePage,
});

function CategoriesProduitsRoutePage() {
	return <CategoriesProduitsPage />;
}
