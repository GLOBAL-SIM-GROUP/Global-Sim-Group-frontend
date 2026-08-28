import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { PressingCommandeDetailPage } from "#/features/portail/components/pressing-commande-detail-page";

/**
 * Détail d'une commande de pressing (M5.x). Affiche le suivi détaillé avec
 * progression des étapes. Page gated par `PRESSING.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/pressing/$id",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PRESSING.VOIR");
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
				void navigate({ to: "/residence/portail/pressing/" });
			}}
		/>
	);
}
