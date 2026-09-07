import { createFileRoute, redirect } from "@tanstack/react-router";

import { hasSessionHint } from "#/core/auth";

/**
 * Racine du site : pas de page publique pour l'instant (vitrine désactivée
 * à la demande produit, pour ne pas exposer d'écran avant l'ouverture) —
 * redirige systématiquement vers l'app, jamais de contenu public affiché.
 *
 * Même mécanisme cookie-indice que `_authenticated.tsx`/`guards.ts` : sans
 * lui, un visiteur déjà connecté qui recharge sur "/" verrait un flash de
 * /login (le SSR ne peut pas lire `localStorage`) avant d'être renvoyé vers
 * /home. Avec l'indice, le SSR redirige directement vers /home ; `/home`
 * (sous `_authenticated`) refait la vraie vérification à l'hydratation et
 * rebondit vers /login si l'indice était périmé.
 *
 * `LandingPage` (`#/features/landing/components/landing-page`) reste
 * disponible pour une réactivation future — juste débranchée d'ici.
 */
export const Route = createFileRoute("/")({
	beforeLoad: async ({ context }) => {
		await context.auth.restore();
		if (context.auth.isAuthenticated || hasSessionHint()) {
			throw redirect({ to: "/home" });
		}
		throw redirect({ to: "/login" });
	},
});
