import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { PressingCommandeDetailPage } from "#/features/portail/components/pressing-commande-detail-page";

/**
 * Détail d'une commande de pressing (M5.x). Affiche le suivi détaillé avec
 * progression des étapes. Page gated par `PORTAIL.VOIR` (comme les autres
 * pages du portail résident — l'endpoint `/pressing/portail/...` requiert
 * `PORTAIL.VOIR`, pas `PRESSING.VOIR`).
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/pressing/$id",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: PressingCommandeDetailRoutePage,
});

function PressingCommandeDetailRoutePage() {
	const { id } = Route.useParams();

	return <PressingCommandeDetailPage id={id} />;
}
