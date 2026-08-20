import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { RolesPage } from "#/features/admin/components/roles-page";

/**
 * Rôles (M11). Pas de search param. Page gated par `ADMIN.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/admin/roles/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "ADMIN.VOIR");
	},
	component: RolesRoutePage,
});

function RolesRoutePage() {
	return <RolesPage />;
}
