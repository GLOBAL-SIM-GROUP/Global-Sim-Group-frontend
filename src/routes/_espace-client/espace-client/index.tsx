import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Accueil de l'espace client (`/espace-client`) — redirige vers le premier
 * (et pour l'instant seul) service construit. Cette décision reste locale à
 * l'espace client (pas dans `_espace-client.tsx`/`_authenticated.tsx`, qui ne
 * font que router vers/depuis l'espace) : quand plusieurs services existeront,
 * c'est ici qu'on choisira quoi montrer par défaut (dashboard, dernier
 * service visité, etc.).
 */
export const Route = createFileRoute("/_espace-client/espace-client/")({
	beforeLoad: () => {
		throw redirect({ to: "/espace-client/restaurant" });
	},
});
