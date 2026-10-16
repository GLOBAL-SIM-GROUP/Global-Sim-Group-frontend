import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { MesDemandesPage } from "#/features/portail/components/mes-demandes-page";

/**
 * « Mes demandes » du portail résident (`/residence/portail/demandes`) :
 * vue agrégée des demandes de tous les services (mêmes endpoints portail
 * que l'espace client). Gated par `PORTAIL.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/demandes/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: DemandesPortailRoutePage,
});

function DemandesPortailRoutePage() {
	return (
		<MesDemandesPage
			breadcrumb={[
				{ label: "Accueil", to: "/" },
				{ label: "Mon espace résident", to: "/residence/portail" },
				{ label: "Mes demandes" },
			]}
			liens={{
				restaurant: "/residence/portail/restaurant",
				pressing: "/residence/portail/pressing",
				salleFete: "/residence/portail/salle-fete",
				boutique: "/residence/portail/boutique",
				residence: "/residence/portail/sejours",
				signalement: "/residence/portail/signalements",
			}}
			variant="resident"
		/>
	);
}
