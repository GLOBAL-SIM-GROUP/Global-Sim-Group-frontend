import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { RapportsPage } from "#/features/rapports/components/rapports-page";

/**
 * Rapports (M10) — génération. Pas de search param. Page gated par
 * `ADMIN.VOIR` (administrateurs et dirigeants).
 */
export const Route = createFileRoute("/_authenticated/rapports/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "ADMIN.VOIR");
	},
	component: RapportsRoutePage,
});

function RapportsRoutePage() {
	return <RapportsPage />;
}
