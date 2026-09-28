import { createFileRoute } from "@tanstack/react-router";

import { PressingDetailPage } from "#/features/espace-client/components/pressing-detail-page";

/**
 * Détail d'une commande de pressing de l'espace client
 * (`/espace-client/pressing/$id`). Cf. `pressing/index.tsx` — gardé par
 * `PORTAIL.VOIR`, accessible à un compte CLIENT (vérifié en direct 2026-09-27).
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/pressing/$id",
)({
	component: PressingDetailRoutePage,
});

function PressingDetailRoutePage() {
	const { id } = Route.useParams();
	return <PressingDetailPage id={id} />;
}
