import { createFileRoute, redirect } from "@tanstack/react-router";

import { hasSessionHint } from "#/core/auth";
import { LandingPage } from "#/features/landing/components/landing-page";

/**
 * Racine du site : vitrine publique (landing) accessible sans compte.
 *
 * Même mécanisme cookie-indice que `_authenticated.tsx`/`guards.ts` : sans
 * lui, un visiteur déjà connecté qui recharge sur "/" verrait un flash de la
 * landing (le SSR ne peut pas lire `localStorage`) avant d'être renvoyé vers
 * /home. Avec l'indice, le SSR redirige directement vers /home ; la page
 * refait la vraie vérification à l'hydratation (`auth.restore()` dans
 * `LandingPage`) et rebondit si l'indice était périmé.
 */
export const Route = createFileRoute("/")({
	beforeLoad: async ({ context }) => {
		await context.auth.restore();
		if (context.auth.isAuthenticated || hasSessionHint()) {
			throw redirect({ to: "/home" });
		}
	},
	component: LandingPage,
});
