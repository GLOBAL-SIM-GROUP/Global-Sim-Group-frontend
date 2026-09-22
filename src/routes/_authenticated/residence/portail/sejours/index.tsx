import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { SejoursPortailPage } from "#/features/portail/components/sejours-portail-page";

/**
 * Demandes de séjour court du portail résident : catalogue des logements
 * disponibles, liste des demandes et nouvelle demande. Page gated par
 * `PORTAIL.VOIR` (comme les autres pages de service du portail —
 * l'endpoint `/residence/portail/sejours/...` requiert `PORTAIL.VOIR`,
 * pas `RESIDENCE.VOIR`).
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/sejours/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: SejoursPortailRoutePage,
});

function SejoursPortailRoutePage() {
	return <SejoursPortailPage variant="resident" />;
}
