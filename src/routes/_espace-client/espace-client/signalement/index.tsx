import { createFileRoute } from "@tanstack/react-router";

import { SignalementPage } from "#/features/espace-client/components/signalement-page";

/**
 * Signalement de l'espace client (`/espace-client/signalement`) :
 * formulaire de déclaration branché sur `POST /signalements/portail`
 * (backend 091, `PORTAIL.VOIR`) — cf. `SignalementPage`.
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/signalement/",
)({
	component: SignalementPage,
});
