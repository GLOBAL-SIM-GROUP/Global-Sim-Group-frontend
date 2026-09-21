import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { BoutiqueDemandesPage } from "#/features/portail/components/boutique-demandes-page";

/**
 * Demandes boutique du portail résident : liste des ventes `EN_ATTENTE`
 * envoyées depuis l'espace client, avec suivi du statut. Page gated par
 * `PORTAIL.VOIR` (comme les autres pages du portail résident).
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/boutique/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: BoutiqueDemandesRoutePage,
});

function BoutiqueDemandesRoutePage() {
	return <BoutiqueDemandesPage />;
}
