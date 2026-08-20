import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { PortailCautionPage } from "#/features/portail/components/portail-caution-page";

/**
 * Ma caution (M2.5). Pas de search param. Page gated par `RESIDENT.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/caution/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENT.VOIR");
	},
	component: PortailCautionRoutePage,
});

function PortailCautionRoutePage() {
	return <PortailCautionPage />;
}
