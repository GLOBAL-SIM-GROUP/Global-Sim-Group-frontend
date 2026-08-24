import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { RevenusUtilisateurPage } from "#/features/finances/components/revenus-utilisateur-page";

/**
 * Revenus agrégés par utilisateur (M8). Gated par FINANCES.VOIR.
 */
export const Route = createFileRoute(
	"/_authenticated/finances/revenus-utilisateur/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FINANCES.VOIR");
	},
	component: RevenusUtilisateurRoutePage,
});

function RevenusUtilisateurRoutePage() {
	return <RevenusUtilisateurPage />;
}
