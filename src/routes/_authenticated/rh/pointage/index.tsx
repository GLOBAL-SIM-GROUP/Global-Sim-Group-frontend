import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { PointagePage } from "#/features/rh/components/pointage-page";

/**
 * Pointage — Arrivée / Départ (M9.2). Pas de search param. Page gated par
 * `RH.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/rh/pointage/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RH.VOIR");
	},
	component: PointageRoutePage,
});

function PointageRoutePage() {
	return <PointagePage />;
}
