import { setLocale } from "#/paraglide/runtime";
import type { Locale } from "./locale";
import { readStoredLocale } from "./storage";

/**
 * Applique la locale persistée (ou la locale par défaut) au runtime Paraglide
 * et synchronise `document.documentElement.lang`.
 *
 * À appeler une fois au démarrage de l'application (dans `__root.tsx`).
 * Le garde `document` protège le rendu SSR.
 */
export function initLocale(): Locale {
	const locale = readStoredLocale();
	setLocale(locale, { reload: false });
	if (typeof document !== "undefined") {
		document.documentElement.lang = locale;
	}
	return locale;
}
