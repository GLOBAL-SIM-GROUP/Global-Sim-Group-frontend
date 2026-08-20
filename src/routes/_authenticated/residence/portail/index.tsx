import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { PortailPage } from "#/features/portail/components/portail-page";

/**
 * Mon espace résident (M2.5). Pas de search param. Page gated par
 * `RESIDENT.VOIR` (le résident est déduit du token par le backend).
 */
export const Route = createFileRoute("/_authenticated/residence/portail/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENT.VOIR");
	},
	component: PortailRoutePage,
});

function PortailRoutePage() {
	return <PortailPage />;
}
