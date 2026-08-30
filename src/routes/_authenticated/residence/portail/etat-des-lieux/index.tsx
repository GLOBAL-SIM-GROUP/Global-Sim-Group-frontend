import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { PortailEtatDesLieuxPage } from "#/features/portail/components/portail-etat-des-lieux-page";

/**
 * Mes états des lieux (portail résident). Pas de search param. Page gated
 * par `RESIDENT.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/etat-des-lieux/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENT.VOIR");
	},
	component: PortailEtatDesLieuxRoutePage,
});

function PortailEtatDesLieuxRoutePage() {
	return <PortailEtatDesLieuxPage />;
}
