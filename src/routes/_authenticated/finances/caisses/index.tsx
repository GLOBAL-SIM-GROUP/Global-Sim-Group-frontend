import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { CaissesPage } from "#/features/finances/components/caisses-page";

/**
 * Gestion des caisses (M8). Gated par `FINANCES.VOIR` — le backend renvoie
 * désormais les caisses filtrées par activité pour un responsable de service
 * sans caisse propre (ex. RESPONSABLE_RESTAURANT), qui n'a que ce verbe.
 * `FINANCES.MODIFIER` reste requis à l'intérieur de la page pour créer/
 * modifier une caisse (`CaissesPage` masque ces actions sans ce verbe).
 */
export const Route = createFileRoute("/_authenticated/finances/caisses/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FINANCES.VOIR");
	},
	component: CaissesRoutePage,
});

function CaissesRoutePage() {
	return <CaissesPage />;
}
