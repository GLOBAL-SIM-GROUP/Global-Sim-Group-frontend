/**
 * Hôte HTTP minimal pour le serveur SSR de production.
 *
 * `vite build` produit `dist/server/server.js`, un handler au format Web
 * `(Request) → Response` (TanStack Start) qui fait le rendu SSR mais NE sert
 * PAS les assets statiques. Ce fichier expose ce handler sur un serveur Node
 * natif (`node:http`), et sert les fichiers de `dist/client/` (JS/CSS/…)
 * — sans dépendance supplémentaire.
 *
 * Utilisé en production (image Docker / `node server.mjs`) et en local pour
 * tester le build. En dev, on utilise `npm run dev` (Vite, avec proxy).
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import serverHandler from "./dist/server/server.js";

const PORT = Number(process.env.PORT ?? 3000);

/**
 * Cible du backend pour le relais `/api/*` (ex. `https://dev.sim.strife-cyber.org`).
 * Si non défini, `/api/*` retombe sur le rendu SSR (404, pas de route).
 * Même pattern que le proxy Vite en dev : le navigateur appelle `/api/v1/…`
 * sur la même origine, et le serveur relaie vers le backend — le CORS du
 * backend (qui refuse `localhost:*`) n'est pas un obstacle côté serveur.
 */
const API_TARGET = process.env.API_TARGET;

/** Racine des fichiers statiques : `dist/client/` (sortie de `vite build`). */
const CLIENT_DIR = fileURLToPath(new URL("./dist/client/", import.meta.url));

const MIME = {
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".html": "text/html; charset=utf-8",
	".json": "application/json",
	".svg": "image/svg+xml",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".webp": "image/webp",
	".avif": "image/avif",
	".ico": "image/x-icon",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
	".txt": "text/plain",
	".map": "application/json",
	".webmanifest": "application/manifest+json",
};

/** Sert un fichier de `dist/client`. `false` si absent ou hors racine. */
function serveStatic(res, pathname) {
	const relPath = decodeURIComponent(pathname).replace(/^[/\\]+/, "");
	const filePath = join(CLIENT_DIR, relPath);
	// Anti-traversée de répertoire : le fichier doit rester dans CLIENT_DIR.
	// (CLIENT_DIR finit par un séparateur, cf. fileURLToPath sur un dossier.)
	if (!filePath.startsWith(CLIENT_DIR)) {
		return false;
	}
	if (!existsSync(filePath) || !statSync(filePath).isFile()) return false;

	res.statusCode = 200;
	res.setHeader("content-type", MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream");
	// Assets hachés → cache long (immutable).
	res.setHeader("cache-control", "public, max-age=31536000, immutable");
	createReadStream(filePath).pipe(res);
	return true;
}

const server = createServer(async (req, res) => {
	try {
		const url = new URL(req.url ?? "/", "http://localhost");

		// En-têtes entrants reconstruits pour la conversion en Web Request.
		const headers = new Headers();
		for (let i = 0; i < req.rawHeaders.length; i += 2) {
			headers.append(req.rawHeaders[i], req.rawHeaders[i + 1]);
		}
		// Un corps n'existe que pour les méthodes qui en portent un.
		const hasBody = req.method !== "GET" && req.method !== "HEAD";
		const body = hasBody ? Readable.toWeb(req) : undefined;

		// Relais `/api/*` vers le backend (si `API_TARGET` est défini).
		// À traiter avant le SSR : `/api/v1/…` n'est pas une route de l'app.
		if (API_TARGET && url.pathname.startsWith("/api/")) {
			// Host et accept-encoding n'ont pas de sens pour le backend :
			// Host = le container, et une réponse compressée nécessiterait
			// un relais de content-encoding (non fait ici).
			headers.delete("host");
			headers.delete("accept-encoding");

			// `duplex: "half"` est requis par undici quand `body` est un
			// ReadableStream (corps entrant relayé tel quel).
			const upstream = new Request(new URL(url.pathname + url.search, API_TARGET), {
				method: req.method,
				headers,
				body,
				duplex: "half",
			});
			const upstreamResponse = await fetch(upstream);
			res.statusCode = upstreamResponse.status;
			for (const [name, value] of upstreamResponse.headers) {
				res.setHeader(name, value);
			}
			if (upstreamResponse.body) {
				Readable.fromWeb(upstreamResponse.body).pipe(res);
			} else {
				res.end();
			}
			return;
		}

		// Chemin avec une extension connue → asset statique (servi ou 404 net).
		if (MIME[extname(url.pathname).toLowerCase()]) {
			if (serveStatic(res, url.pathname)) return;
			res.statusCode = 404;
			res.end("Not Found");
			return;
		}

		// Sinon : rendu SSR (routes de l'app + 404 SPA).
		// Même `duplex: "half"` que pour le relais (body stream possible).
		const request = new Request(url, { method: req.method, headers, body, duplex: "half" });
		const response = await serverHandler.fetch(request);

		res.statusCode = response.status;
		for (const [name, value] of response.headers) res.setHeader(name, value);
		if (response.body) {
			Readable.fromWeb(response.body).pipe(res);
		} else {
			res.end();
		}
	} catch (error) {
		console.error(error);
		res.statusCode = 500;
		res.end("Internal Server Error");
	}
});

server.listen(PORT, () => {
	console.log(`SIM frontend (SSR) → http://localhost:${PORT}`);
});
