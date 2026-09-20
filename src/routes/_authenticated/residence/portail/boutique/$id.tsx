import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { BoutiqueDemandePortailDetailPage } from "#/features/portail/components/boutique-demande-detail-page";

/**
 * Détail d'une demande boutique du portail résident : lignes, suivi du
 * statut et annulation tant qu'elle est `EN_ATTENTE`. Page gated par
 * `RESIDENT.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/boutique/$id",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENT.VOIR");
	},
	component: BoutiqueDemandeDetailRoutePage,
});

function BoutiqueDemandeDetailRoutePage() {
	const { id } = Route.useParams();

	return <BoutiqueDemandePortailDetailPage id={id} />;
}
