import { createFileRoute } from "@tanstack/react-router";

import { SejoursPortailPage } from "#/features/portail/components/sejours-portail-page";

/**
 * Séjours courts de l'espace client (`/espace-client/residence`) : catalogue
 * des logements disponibles sur la période (`GET
 * /residence/portail/sejours/logements`) puis demande (`POST
 * /residence/portail/sejours`, `RESIDENCE.DEMANDER` → `EN_ATTENTE`). Le tarif
 * est fixé par le personnel à la validation (residence 087+088).
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/residence/",
)({
	component: ResidenceRoutePage,
});

function ResidenceRoutePage() {
	return <SejoursPortailPage variant="client" />;
}
