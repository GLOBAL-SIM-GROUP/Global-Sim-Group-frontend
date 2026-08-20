import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { ClientFichePage } from "#/features/clients/components/client-fiche-page";

/**
 * Fiche client (3.1/3.2). Pas de search param. Page gated par `CLIENT.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/client/clients/$id")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "CLIENT.VOIR");
	},
	component: ClientFicheRoutePage,
});

function ClientFicheRoutePage() {
	const { id } = Route.useParams();
	return <ClientFichePage id={id} />;
}
