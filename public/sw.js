/**
 * Service worker minimal — écrit à la main plutôt que généré par un plugin
 * (vite-plugin-pwa ne produit pas de sortie exploitable avec le pipeline de
 * build de TanStack Start). Pas de précache des bundles JS/CSS hashés : leurs
 * noms changent à chaque déploiement, un précache figé deviendrait vite
 * obsolète. Rôle unique : rendre l'app installable (desktop + mobile) via un
 * gestionnaire `fetch`, avec un solde de secours réseau→cache très limité.
 *
 * Ne jamais mettre en cache `/api/*` : les données (loyers, paiements,
 * stocks…) doivent toujours venir du réseau, jamais d'une réponse figée.
 */

const CACHE_NAME = "sim-shell-v1";
const APP_SHELL = ["/logo.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
	self.skipWaiting();
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(APP_SHELL))
			.catch(() => {}),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;

	// Jamais d'interception pour l'API — toujours le réseau.
	if (request.method !== "GET" || request.url.includes("/api/")) return;

	// Réseau d'abord ; secours cache uniquement si hors-ligne (best-effort,
	// ne couvre que ce qui a été explicitement mis en cache ci-dessus).
	event.respondWith(
		fetch(request).catch(() => caches.match(request)),
	);
});
