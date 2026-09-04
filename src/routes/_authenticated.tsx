import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthenticatedLayout } from "#/components/layout/authenticated-layout";
import { hasSessionHint, requireAuth } from "#/core/auth";

/**
 * Layout protégé : avant tout rendu, le guard redirige vers /login si la
 * session est absente. Sur le client, on restaure d'abord la session depuis
 * les tokens persistés (rechargement de page) ; en cas d'échec, la redirection
 * vers /login porte l'URL d'origine (`?next=`) pour y revenir après connexion.
 * `AuthProvider` est monté dans `AuthenticatedLayout` (pas à la racine) — la
 * page de login, publique, accède à la session via le contexte route.
 * `NotificationsProvider` est monté juste après : le socket temps réel ne se
 * connecte que pour une session authentifiée.
 */
export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ context, location }) => {
		await context.auth.restore();
		if (!context.auth.isAuthenticated) {
			// Sur le serveur, `restore()` ne fait rien (pas de localStorage) : sans
			// le cookie-indice (`hasSessionHint`), un utilisateur bien connecté
			// serait quand même redirigé vers /login à chaque rechargement — d'où
			// le flash « Vérification de la session… ». Avec l'indice présent, on
			// laisse passer côté SSR. IMPORTANT : `beforeLoad` ne se réexécute PAS
			// à l'hydratation du tout premier rendu (seulement sur les navigations
			// suivantes) — la vraie vérification a donc lieu dans le composant
			// `AuthenticatedLayout`, via un `useEffect` qui appelle
			// `router.invalidate()` après `restore()` pour forcer ce `beforeLoad`
			// (et ceux des routes filles, ex. `requirePermissions`) à rejouer pour
			// de vrai.
			if (hasSessionHint()) return;
			throw redirect({
				href: `/login?next=${encodeURIComponent(location.href)}`,
			});
		}
		requireAuth(context.auth);
	},
	component: AuthenticatedLayout,
});
