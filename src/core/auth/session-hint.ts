import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

/**
 * Cookie non-sensible (jamais les tokens) posé/retiré en même temps que les
 * tokens dans `localStorage` (session.ts). Le SSR ne peut pas lire
 * `localStorage` : sans indice, `beforeLoad` voit toujours un visiteur
 * authentifié comme non connecté au premier rendu serveur et le redirige vers
 * `/login` — d'où le flash « Vérification de la session… » à chaque
 * rechargement d'une page protégée. Avec ce cookie, le SSR laisse passer
 * l'utilisateur probablement connecté ; la vraie vérification a lieu à
 * l'hydratation client, où `beforeLoad` s'exécute à nouveau avec
 * `localStorage` cette fois disponible (guards.ts, _authenticated.tsx).
 */
const SESSION_HINT_COOKIE = "sim.has_session";

/** Pose l'indicateur ; à appeler chaque fois que les tokens sont écrits. */
export function markSessionHint(maxAgeSeconds: number): void {
	if (typeof document === "undefined") return;
	const secure = location.protocol === "https:" ? "; Secure" : "";
	const maxAge = Math.max(0, Math.floor(maxAgeSeconds));
	// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API absente de Firefox/Safari.
	document.cookie = `${SESSION_HINT_COOKIE}=1; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

/** Retire l'indicateur ; à appeler chaque fois que les tokens sont purgés. */
export function clearSessionHint(): void {
	if (typeof document === "undefined") return;
	// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API absente de Firefox/Safari.
	document.cookie = `${SESSION_HINT_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Lecture SSR uniquement (implémentation client no-op : `createIsomorphicFn`
 * exclut la branche serveur — et son import de `@tanstack/react-start/server`
 * — du bundle client). Un cookie absent est fiable (redirection normale) ; un
 * cookie présent n'est qu'un indice (peut être périmé) — jamais utilisé pour
 * autoriser quoi que ce soit, seulement pour éviter une redirection
 * prématurée avant la vérification cliente réelle.
 */
export const hasSessionHint = createIsomorphicFn()
	.server(() => {
		try {
			return getCookie(SESSION_HINT_COOKIE) === "1";
		} catch {
			return false;
		}
	})
	.client(() => false);
