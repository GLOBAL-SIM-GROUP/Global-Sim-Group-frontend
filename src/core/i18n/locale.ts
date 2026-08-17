import type { Locale } from "#/paraglide/runtime";
import { baseLocale, isLocale, locales } from "#/paraglide/runtime";

export type { Locale };

/**
 * Locale par défaut. Vient de la source Paraglide (`fr`) : c'est la seule
 * autorité — ne pas dupliquer le littéral ici.
 */
export const DEFAULT_LOCALE: Locale = baseLocale;

/** Locales supportées, dans l'ordre du projet Paraglide. */
export const SUPPORTED_LOCALES: readonly Locale[] = locales;

/** Garde de type : `value` est une locale supportée. */
export function isSupportedLocale(value: unknown): value is Locale {
	return isLocale(value);
}
