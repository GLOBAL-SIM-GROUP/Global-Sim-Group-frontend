import {
	createFileRoute,
	Outlet,
	redirect,
	useRouteContext,
	useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "#/components/layout/app-shell";
import { AuthProvider, hasSessionHint, requireAuth } from "#/core/auth";
import { NotificationsProvider } from "#/core/notifications";

/**
 * Layout protégé : avant tout rendu, le guard redirige vers /login si la
 * session est absente. Sur le client, on restaure d'abord la session depuis
 * les tokens persistés (rechargement de page) ; en cas d'échec, la redirection
 * vers /login porte l'URL d'origine (`?next=`) pour y revenir après connexion.
 * `AuthProvider` est monté ici (pas à la racine) — la page de login, publique,
 * accède à la session via le contexte route. `NotificationsProvider` est monté
 * juste après : le socket temps réel ne se connecte que pour une session
 * authentifiée.
 */
export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ context, location }) => {
		await context.auth.restore();
		if (!context.auth.isAuthenticated) {
			// Sur le serveur, `restore()` ne fait rien (pas de localStorage) : sans
			// le cookie-indice (`hasSessionHint`), un utilisateur bien connecté
			// serait quand même redirigé vers /login à chaque rechargement — d'où
			// le flash « Vérification de la session… ». Avec l'indice présent, on
			// laisse passer ; la vraie vérification a lieu à l'hydratation client
			// (ce `beforeLoad` s'exécute à nouveau, `localStorage` disponible).
			if (hasSessionHint()) return;
			throw redirect({
				href: `/login?next=${encodeURIComponent(location.href)}`,
			});
		}
		requireAuth(context.auth);
	},
	component: AuthenticatedLayout,
});

export function AuthenticatedLayout() {
	const { auth, notifications } = useRouteContext({ from: "/_authenticated" });
	const router = useRouter();

	// `beforeLoad` ne protège que la NAVIGATION : si le refresh silencieux
	// planifié (ou déclenché par un 401) échoue pendant que l'utilisateur est
	// déjà sur une page protégée (refresh token expiré/révoqué côté backend),
	// `handleSessionExpired` purge la session SANS rediriger — l'utilisateur
	// restait sur une page qui ne fonctionnait plus (401 en boucle), perçu
	// comme une déconnexion silencieuse et inexpliquée. On réagit ici à toute
	// transition authentifié → non-authentifié survenant après le montage.
	useEffect(() => {
		return auth.subscribe(() => {
			if (!auth.isAuthenticated) {
				void router.navigate({
					href: `/login?expired=1&next=${encodeURIComponent(window.location.href)}`,
					replace: true,
				});
			}
		});
	}, [auth, router]);

	return (
		<AuthProvider session={auth}>
			<NotificationsProvider client={notifications}>
				<AppShell>
					<Outlet />
				</AppShell>
			</NotificationsProvider>
		</AuthProvider>
	);
}
