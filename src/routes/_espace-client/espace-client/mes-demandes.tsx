import { createFileRoute } from "@tanstack/react-router";

import { MesDemandesPage } from "#/features/espace-client/components/mes-demandes-page";

/**
 * « Mes demandes » de l'espace client (`/espace-client/mes-demandes`) :
 * dépôts pressing (données réelles) + demandes envoyées depuis les
 * formulaires (persistées localement, aucun endpoint CLIENT n'existe).
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/mes-demandes",
)({
	component: MesDemandesPage,
});
