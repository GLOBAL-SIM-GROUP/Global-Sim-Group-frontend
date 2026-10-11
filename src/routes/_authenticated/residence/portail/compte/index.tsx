import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { PortailComptePage } from "#/features/portail/components/portail-compte-page";

/**
 * « Mon compte » du résident : infos de compte (`/auth/me` + résumé portail)
 * et envoi de l'email de réinitialisation de mot de passe. Page gated par
 * `RESIDENT.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/compte/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENT.VOIR");
	},
	component: PortailCompteRoutePage,
});

function PortailCompteRoutePage() {
	return <PortailComptePage />;
}
