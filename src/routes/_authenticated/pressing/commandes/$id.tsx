import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { CommandeFichePage } from "#/features/pressing/components/commande-fiche-page";

/**
 * Fiche commande — Pressing (M4). Pas de search param. Page gated par
 * `PRESSING.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/pressing/commandes/$id")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PRESSING.VOIR");
	},
	component: CommandeFicheRoutePage,
});

function CommandeFicheRoutePage() {
	const { id } = Route.useParams();
	return <CommandeFichePage id={id} />;
}
