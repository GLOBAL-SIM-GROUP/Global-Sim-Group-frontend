import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { RolePermissionsPage } from "#/features/admin/components/role-permissions-page";

/**
 * Permissions d'un rôle (M11). Pas de search param. Page gated par
 * `ADMIN.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/admin/roles/$id/permissions/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "ADMIN.VOIR");
	},
	component: RolePermissionsRoutePage,
});

function RolePermissionsRoutePage() {
	const { id } = Route.useParams();
	return <RolePermissionsPage id={id} />;
}
