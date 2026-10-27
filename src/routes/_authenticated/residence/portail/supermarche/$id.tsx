import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { SuperMarcheDemandePortailDetailPage } from "#/features/portail/components/supermarche-demande-detail-page";

/**
 * Détail d'une demande super-marché du portail résident : lignes, suivi du
 * statut et annulation tant qu'elle est `EN_ATTENTE`. Page gated par
 * `PORTAIL.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/supermarche/$id",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: BoutiqueDemandeDetailRoutePage,
});

function BoutiqueDemandeDetailRoutePage() {
	const { id } = Route.useParams();

	return (
		<SuperMarcheDemandePortailDetailPage
			id={id}
			breadcrumbAccueil={{
				label: "Mon espace résident",
				to: "/residence/portail",
			}}
			labelListe="Super-Marché"
			lienListe="/residence/portail/supermarche"
			labelRetour="Retour à la liste"
		/>
	);
}
