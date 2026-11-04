import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest tourne sans `globals: true` : le cleanup automatique de
// @testing-library/react n'est pas enregistré. On le branche explicitement.
afterEach(() => {
	cleanup();
});

// jsdom n'implémente pas `window.matchMedia` — stub minimal (jamais
// "matches", l'environnement de test n'est ni une PWA installée ni en
// préférence "prefers-reduced-motion") pour les composants qui l'appellent
// (ex. `AppLaunchSplash`).
if (typeof window !== "undefined" && !window.matchMedia) {
	window.matchMedia = (query: string) =>
		({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}) as MediaQueryList;
}

// jsdom n'implémente ni `ResizeObserver` ni `IntersectionObserver` — stubs
// no-op pour les composants qui en dépendent (ex. `Carousel`, `AccordionGallery`).
// Pas besoin de déclencher les callbacks : l'état initial (`visible = true`,
// largeur par défaut) suffit en environnement de test.
if (typeof window !== "undefined" && !window.ResizeObserver) {
	window.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}
if (typeof window !== "undefined" && !window.IntersectionObserver) {
	window.IntersectionObserver = class {
		root = null;
		rootMargin = "";
		thresholds: ReadonlyArray<number> = [];
		observe() {}
		unobserve() {}
		disconnect() {}
		takeRecords(): IntersectionObserverEntry[] {
			return [];
		}
	} as unknown as typeof IntersectionObserver;
}

// jsdom n'implémente pas `window.localStorage` dans la config de ce projet
// (`localStorage` vaut `undefined`, pas juste vide) — stub en mémoire pour
// les hooks qui en dépendent (ex. `usePanier`).
if (typeof window !== "undefined" && !window.localStorage) {
	const store = new Map<string, string>();
	Object.defineProperty(window, "localStorage", {
		configurable: true,
		value: {
			getItem: (cle: string) => store.get(cle) ?? null,
			setItem: (cle: string, valeur: string) => {
				store.set(cle, String(valeur));
			},
			removeItem: (cle: string) => {
				store.delete(cle);
			},
			clear: () => {
				store.clear();
			},
			key: (index: number) => Array.from(store.keys())[index] ?? null,
			get length() {
				return store.size;
			},
		} satisfies Storage,
	});
}
