import { createFileRoute } from "@tanstack/react-router";

import { SignalementDetailEspacePage } from "#/features/espace-client/components/signalement-detail-page";

/**
 * Fiche d'un signalement de l'espace client
 * (`/espace-client/signalement/$id`) — `GET /signalements/portail/:id`
 * (`PORTAIL.VOIR`) ; 404 si le signalement appartient à un autre client.
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/signalement/$id",
)({
	component: SignalementDetailRoutePage,
});

function SignalementDetailRoutePage() {
	const { id } = Route.useParams();
	return <SignalementDetailEspacePage id={id} />;
}
