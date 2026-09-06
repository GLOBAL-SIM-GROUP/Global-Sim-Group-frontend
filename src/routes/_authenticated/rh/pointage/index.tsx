import { createFileRoute, redirect } from "@tanstack/react-router";

import { PointagePage } from "#/features/rh/components/pointage-page";

/**
 * Pointage — Arrivée / Départ (M9.2). Masqué de la navigation et de l'accès
 * direct (redirection systématique) — fonctionnalité retirée de l'UI.
 */
export const Route = createFileRoute("/_authenticated/rh/pointage/")({
	beforeLoad: () => {
		throw redirect({ to: "/rh/employes" });
	},
	component: PointageRoutePage,
});

function PointageRoutePage() {
	return <PointagePage />;
}
