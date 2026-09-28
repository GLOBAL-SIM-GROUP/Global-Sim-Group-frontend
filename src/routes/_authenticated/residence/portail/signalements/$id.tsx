import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { SignalementDetailPage } from "#/features/portail/components/signalement-detail-page";

/**
 * Fiche d'un signalement du résident connecté
 * (`/residence/portail/signalements/$id`) — `GET /signalements/portail/:id`
 * (`PORTAIL.VOIR`) ; 404 si le signalement appartient à un autre déclarant.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/signalements/$id",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: SignalementDetailRoutePage,
});

function SignalementDetailRoutePage() {
	const { id } = Route.useParams();
	return (
		<SignalementDetailPage
			id={id}
			lienListe="/residence/portail/signalements"
			labelRetour="Retour à mes signalements"
			breadcrumbAccueil={{
				label: "Mon espace résident",
				to: "/residence/portail",
			}}
		/>
	);
}
