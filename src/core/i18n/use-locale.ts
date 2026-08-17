import { useCallback, useSyncExternalStore } from "react";
import { setLocale as applyLocale, getLocale } from "#/paraglide/runtime";
import type { Locale } from "./locale";
import { DEFAULT_LOCALE, isSupportedLocale } from "./locale";
import { storeLocale } from "./storage";

/**
 * Paraglide (`getLocale`/`setLocale`) n'abonne pas React. Cette mini-store
 * notifie les abonnés à chaque changement de locale : les composants qui
 * lisent `useLocale()` re-rendent, et leurs appels aux messages Paraglide
 * (qui relisent `getLocale()` au rendu) sont réévalués dans la bonne langue.
 */
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

function getCurrentLocale(): Locale {
	const current = getLocale();
	return isSupportedLocale(current) ? current : DEFAULT_LOCALE;
}

function applyDocumentLocale(locale: Locale): void {
	if (typeof document === "undefined") return;
	document.documentElement.lang = locale;
}

export interface UseLocaleResult {
	locale: Locale;
	/** Change la locale, la persiste et notifie les abonnés. */
	setLocale: (next: Locale) => void;
}

export function useLocale(): UseLocaleResult {
	// `getServerSnapshot` est requis par React en SSR : le serveur rend toujours
	// la locale par défaut (pas de locale persistée côté serveur), puis le
	// client bascule vers la locale persistée après hydratation.
	const locale = useSyncExternalStore(
		subscribe,
		getCurrentLocale,
		() => DEFAULT_LOCALE,
	);

	const changeLocale = useCallback((next: Locale) => {
		applyLocale(next, { reload: false });
		storeLocale(next);
		applyDocumentLocale(next);
		for (const listener of listeners) listener();
	}, []);

	return { locale, setLocale: changeLocale };
}
