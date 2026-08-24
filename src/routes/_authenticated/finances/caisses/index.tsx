import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { CaissesPage } from "#/features/finances/components/caisses-page";

/**
 * Gestion des caisses (M8). Admins uniquement (FINANCES.MODIFIER).
 */
export const Route = createFileRoute("/_authenticated/finances/caisses/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FINANCES.MODIFIER");
	},
	component: CaissesRoutePage,
});

function CaissesRoutePage() {
	return <CaissesPage />;
}
