import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { PressingCommandeDetailPage } from "#/features/portail/components/pressing-commande-detail-page";

/**
 * Détail d'une commande de pressing (M5.x). Affiche le suivi détaillé avec
 * progression des étapes. Page gated par `RESIDENT.VOIR` (comme les autres
 * pages du portail résident — l'endpoint `/pressing/portail/...` requiert
 * `RESIDENT.VOIR`, pas `PRESSING.VOIR`).
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/pressing/$id",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENT.VOIR");
	},
	component: PressingCommandeDetailRoutePage,
});

function PressingCommandeDetailRoutePage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	return (
		<PressingCommandeDetailPage
			id={id}
			onBack={() => {
				void navigate({ to: "/residence/portail/pressing" });
			}}
		/>
	);
}
