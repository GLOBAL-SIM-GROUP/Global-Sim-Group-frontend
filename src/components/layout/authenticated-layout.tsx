import { Outlet, useRouteContext, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { AuthProvider } from "#/core/auth";
import { NotificationsProvider } from "#/core/notifications";

import { AppShell } from "./app-shell";

/**
 * Layout protégé (extrait de `routes/_authenticated.tsx` — un composant
 * exporté en plus de `Route` empêche TanStack Router de découper cette route
 * dans son propre chunk, voir l'avertissement "will not be code-split").
 */
export function AuthenticatedLayout() {
	const { auth, notifications } = useRouteContext({ from: "/_authenticated" });
	const router = useRouter();

	// Restauration réelle après un rendu SSR optimiste (cookie-indice, cf.
	// `beforeLoad` de `routes/_authenticated.tsx`) : sans cet effet,
	// `auth.restore()` n'est JAMAIS appelé après un rechargement de page —
	// vérifié empiriquement (aucune requête réseau vers /auth/*), laissant
	// `user` à `null` indéfiniment (sidebar/permissions vides en permanence,
	// pas juste un flash). Une fois la session restaurée, `router.invalidate()`
	// rejoue `beforeLoad` de toute la chaîne de routes (dont `requirePermissions`
	// des routes filles) — c'est le seul moyen de les redéclencher hors navigation.
	useEffect(() => {
		if (auth.isAuthenticated) return;
		let cancelled = false;
		(async () => {
			await auth.restore();
			if (cancelled) return;
			if (auth.isAuthenticated) {
				void router.invalidate();
			} else {
				void router.navigate({
					href: `/login?next=${encodeURIComponent(window.location.href)}`,
					replace: true,
				});
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [auth, router]);

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
