import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import type { AuthSession } from "./session";

/**
 * Restauration de session + réaction à son expiration, pour tout layout
 * protégé (extrait de `AuthenticatedLayout` — même logique requise par
 * `ClientLayout`, pas de raison de la dupliquer).
 *
 * Restauration : après un rendu SSR optimiste (cookie-indice), `auth.restore()`
 * n'est JAMAIS appelé après un rechargement de page sans cet effet — vérifié
 * empiriquement (aucune requête réseau vers /auth/*), laissant `user` à `null`
 * indéfiniment. Une fois la session restaurée, `router.invalidate()` rejoue
 * `beforeLoad` de toute la chaîne de routes — seul moyen de le redéclencher
 * hors navigation.
 *
 * Expiration : `beforeLoad` ne protège que la navigation. Si le refresh
 * silencieux échoue pendant que l'utilisateur est déjà sur une page protégée
 * (refresh token expiré/révoqué côté backend), on réagit ici à toute
 * transition authentifié → non-authentifié survenant après le montage, au
 * lieu de laisser l'utilisateur sur une page qui ne fonctionne plus (401 en
 * boucle, perçu comme une déconnexion silencieuse et inexpliquée).
 */
export function useSessionBootstrap(auth: AuthSession): void {
	const router = useRouter();

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
}
