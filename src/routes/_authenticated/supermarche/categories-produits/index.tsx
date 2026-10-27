import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { CategoriesProduitsPage } from "#/features/marchandise/components/categories-produits-page";

/**
 * Catégories de produits — Market (M3). Pas de search param. Page gated par
 * `MARCHANDISE.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/marchandise/categories-produits/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "MARCHANDISE.VOIR");
	},
	component: CategoriesProduitsRoutePage,
});

function CategoriesProduitsRoutePage() {
	return <CategoriesProduitsPage />;
}
