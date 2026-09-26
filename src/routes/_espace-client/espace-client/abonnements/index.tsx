import { createFileRoute } from "@tanstack/react-router";

import { AbonnementsEspacePage } from "#/features/espace-client/components/abonnements-page";

/**
 * « Mes abonnements » de l'espace client (`/espace-client/abonnements`) —
 * quotas prépayés pressing & restaurant du client connecté. Lecture seule :
 * la vente reste une action staff au comptoir (pas de self-service côté
 * backend).
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/abonnements/",
)({
	component: AbonnementsEspacePage,
});
