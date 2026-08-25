import { createFileRoute } from "@tanstack/react-router";
import { CaissierTiragesPage } from "#/features/finances/components/caissier-tirages-page";

export const Route = createFileRoute("/_authenticated/finances/caissier/$id/tirages")({
	component: CaissierTiragesRoute,
});

function CaissierTiragesRoute() {
	const { id } = Route.useParams();
	return <CaissierTiragesPage id={id} />;
}
