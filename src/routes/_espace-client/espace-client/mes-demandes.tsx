import { createFileRoute } from "@tanstack/react-router";

import { MesDemandesPage } from "#/features/portail/components/mes-demandes-page";

/**
 * « Mes demandes » de l'espace client (`/espace-client/mes-demandes`) :
 * vue agrégée des demandes de tous les services portail — statuts en
 * temps réel depuis les endpoints `/…/portail`.
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/mes-demandes",
)({
	component: MesDemandesEspaceRoutePage,
});

function MesDemandesEspaceRoutePage() {
	return (
		<MesDemandesPage
			breadcrumb={[
				{ label: "Espace client", to: "/espace-client" },
				{ label: "Mes demandes" },
			]}
			liens={{
				restaurant: "/espace-client/restaurant",
				pressing: "/espace-client/pressing",
				salleFete: "/espace-client/salle-fete",
				supermarche: "/espace-client/supermarche",
				residence: "/espace-client/residence",
				signalement: "/espace-client/signalement",
			}}
			variant="client"
		/>
	);
}
