import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { AbonnementsPage } from "#/features/portail/components/abonnements-page";

/**
 * « Mes abonnements » du portail résident (quotas prépayés pressing &
 * restaurant — backend 089/090). Page gated par `PORTAIL.VOIR` comme les
 * autres pages du portail résident ; l'endpoint `/abonnement/portail/...`
 * requiert `PORTAIL.VOIR` et scope au client du JWT.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/abonnements/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: AbonnementsRoutePage,
});

function AbonnementsRoutePage() {
	return (
		<AbonnementsPage
			lienDetail="/residence/portail/abonnements/$id"
			breadcrumbAccueil={{
				label: "Mon espace résident",
				to: "/residence/portail",
			}}
			className="w-full space-y-6 p-6"
		/>
	);
}
