import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { AbonnementDetailPage } from "#/features/portail/components/abonnement-detail-page";

/**
 * Détail d'un abonnement du résident connecté — solde, validité, reste à
 * payer et historique des mouvements. `PORTAIL.VOIR` ; le backend renvoie
 * 404 pour la souscription d'un autre client.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/abonnements/$id",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: AbonnementDetailRoutePage,
});

function AbonnementDetailRoutePage() {
	const { id } = Route.useParams();
	return (
		<AbonnementDetailPage
			id={id}
			lienListe="/residence/portail/abonnements"
			breadcrumbAccueil={{
				label: "Mon espace résident",
				to: "/residence/portail",
			}}
			lienCommandePressing="/residence/portail/pressing"
			lienCommandeRestaurant="/residence/portail/restaurant"
			className="w-full space-y-6 p-6"
		/>
	);
}
