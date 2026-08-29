import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { PressingCommandesPage } from "#/features/portail/components/pressing-commandes-page";

/**
 * Suivi Pressing (M5.x). Page du portail résident affichant les commandes de
 * pressing en cours et traitées. Page gated par `RESIDENT.VOIR` (comme les
 * autres pages du portail résident — l'endpoint `/pressing/portail/...`
 * requiert `RESIDENT.VOIR`, pas `PRESSING.VOIR`).
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/pressing/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENT.VOIR");
	},
	component: PressingCommandesRoutePage,
});

function PressingCommandesRoutePage() {
	return <PressingCommandesPage />;
}
