import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { CategoriesChargesPage } from "#/features/residence/components/categories-charges-page";

/**
 * Liste des catégories de charges (M2.4). Pas de search param. Page gated par
 * `RESIDENCE.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/categories-charges/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENCE.VOIR");
	},
	component: CategoriesChargesRoutePage,
});

function CategoriesChargesRoutePage() {
	return <CategoriesChargesPage />;
}
