import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { CategoriesDepensesPage } from "#/features/finances/components/categories-depenses-page";

/**
 * Catégories de dépenses (M8). Pas de search param. Page gated par
 * `FINANCES.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/finances/categories-depenses/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FINANCES.VOIR");
	},
	component: CategoriesDepensesRoutePage,
});

function CategoriesDepensesRoutePage() {
	return <CategoriesDepensesPage />;
}
