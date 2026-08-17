import type { Locale } from "./locale";
import { DEFAULT_LOCALE, isSupportedLocale } from "./locale";

/**
 * Clé localStorage du sélecteur explicite de langue. Volontairement distincte
 * de la clé interne de Paraglide (`PARAGLIDE_LOCALE`) : la locale ne doit
 * jamais être détectée automatiquement depuis le navigateur — uniquement
 * posée par le sélecteur de l'utilisateur.
 */
const STORAGE_KEY = "sim.locale";

/** Relit la locale persistée, ou la locale par défaut si absente/invalide. */
export function readStoredLocale(): Locale {
	if (typeof localStorage === "undefined") return DEFAULT_LOCALE;
	const raw = localStorage.getItem(STORAGE_KEY);
	return raw !== null && isSupportedLocale(raw) ? raw : DEFAULT_LOCALE;
}

/** Persiste la locale choisie par l'utilisateur. */
export function storeLocale(locale: Locale): void {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem(STORAGE_KEY, locale);
}
