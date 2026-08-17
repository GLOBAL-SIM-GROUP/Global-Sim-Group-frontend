/**
 * Frontière d'internationalisation du frontend.
 *
 * Paraglide (CLI + plugin Vite) compile `messages/{fr,en}.json` vers
 * `src/paraglide/` (généré, gitignoré). Tout le reste de l'application
 * passe par cette couche : jamais de string en dur, jamais de
 * `getLocale`/`setLocale` de Paraglide appelé directement.
 */
export { getErrorMessageForCode } from "./error-messages";
export { initLocale } from "./init";
export type { Locale } from "./locale";
export { DEFAULT_LOCALE, isSupportedLocale, SUPPORTED_LOCALES } from "./locale";
export { readStoredLocale, storeLocale } from "./storage";
export type { UseLocaleResult } from "./use-locale";
export { useLocale } from "./use-locale";
