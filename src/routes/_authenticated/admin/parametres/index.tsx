import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { ParametresPage } from "#/features/admin/components/parametres-page";

/**
 * Paramètres généraux (M11). Pas de search param. Page gated par
 * `ADMIN.VOIR` (les paramètres vivent sous CORE côté backend).
 */
export const Route = createFileRoute("/_authenticated/admin/parametres/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "ADMIN.VOIR");
	},
	component: ParametresRoutePage,
});

function ParametresRoutePage() {
	return <ParametresPage />;
}
