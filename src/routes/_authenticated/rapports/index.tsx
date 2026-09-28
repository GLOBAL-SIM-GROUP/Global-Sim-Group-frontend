import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { RapportsPage } from "#/features/rapports/components/rapports-page";

/**
 * Rapports (M10) — génération. Pas de search param. Page gated par
 * `RAPPORTS.VOIR` (module réel, distinct d'`ADMIN` — vérifié en direct
 * 2026-09-27 : accordé aux administrateurs/dirigeants ET aux 5 rôles
 * Responsable, qui n'ont pas `ADMIN.VOIR`).
 */
export const Route = createFileRoute("/_authenticated/rapports/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RAPPORTS.VOIR");
	},
	component: RapportsRoutePage,
});

function RapportsRoutePage() {
	return <RapportsPage />;
}
