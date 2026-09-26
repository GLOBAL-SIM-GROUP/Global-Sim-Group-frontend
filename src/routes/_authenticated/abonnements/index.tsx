import { createFileRoute, redirect } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";

/**
 * Module Abonnements — racine : redirection vers les souscriptions (vue
 * principale du comptoir). Accès gated par `ABONNEMENT.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/abonnements/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "ABONNEMENT.VOIR");
		throw redirect({ to: "/abonnements/souscriptions" });
	},
});
