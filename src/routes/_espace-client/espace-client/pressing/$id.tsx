import { createFileRoute } from "@tanstack/react-router";

import { PressingDetailPage } from "#/features/espace-client/components/pressing-detail-page";

/**
 * Détail d'une commande de pressing de l'espace client
 * (`/espace-client/pressing/$id`). Cf. `pressing/index.tsx` pour la réserve
 * sur l'accès backend (`RESIDENT.VOIR`).
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
