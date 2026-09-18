import { createFileRoute } from "@tanstack/react-router";

import { SignalementPage } from "#/features/espace-client/components/signalement-page";

/**
 * Signalement de l'espace client (`/espace-client/signalement`) :
 * formulaire de demande, sans appel réseau — le module signalements est
 * staff-only, cf. `SignalementPage`.
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/signalement",
)({
	component: SignalementPage,
});
