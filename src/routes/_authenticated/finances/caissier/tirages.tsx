import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { CaissierTiragesPage } from "#/features/finances/components/caissier-tirages-page";

/**
 * Tirages (fermetures de caisse) du caissier connecté (M8). Gated par
 * `FINANCES.VOIR` ; la création est gérée dans la page via `FINANCES.CREER`.
 */
export const Route = createFileRoute(
	"/_authenticated/finances/caissier/tirages",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FINANCES.VOIR");
	},
	component: CaissierTiragesPage,
});
