import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { OffresPage } from "#/features/abonnement/components/offres-page";

/**
 * Offres — Abonnements : catalogue des quotas prépayés vendables.
 * Page gated par `ABONNEMENT.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/abonnements/offres/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "ABONNEMENT.VOIR");
	},
	component: OffresPage,
});
