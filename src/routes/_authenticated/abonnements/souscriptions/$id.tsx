import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { SouscriptionDetailPage } from "#/features/abonnement/components/souscription-detail";

/**
 * Fiche souscription — Abonnements : solde en direct, actions staff et
 * journal des mouvements. Page gated par `ABONNEMENT.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/abonnements/souscriptions/$id",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "ABONNEMENT.VOIR");
	},
	component: SouscriptionDetailRoutePage,
});

function SouscriptionDetailRoutePage() {
	const { id } = Route.useParams();
	return <SouscriptionDetailPage id={id} />;
}
