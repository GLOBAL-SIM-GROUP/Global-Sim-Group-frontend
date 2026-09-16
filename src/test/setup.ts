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
