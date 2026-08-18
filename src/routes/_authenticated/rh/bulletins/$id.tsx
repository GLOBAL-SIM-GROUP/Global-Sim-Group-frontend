import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { BulletinFichePage } from "#/features/rh/components/bulletin-fiche-page";

/**
 * Fiche bulletin de salaire (M9.3). Pas de search param. Page gated par
 * `RH.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/rh/bulletins/$id")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RH.VOIR");
	},
	component: BulletinFicheRoutePage,
});

function BulletinFicheRoutePage() {
	const { id } = Route.useParams();
	return <BulletinFichePage id={id} />;
}
