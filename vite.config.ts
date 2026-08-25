import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

// Nitro pour Vercel seulement (optimise SSR serverless).
// Docker utilise le hôte custom prod-server.mjs.
const isVercel = process.env.VERCEL === "1";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	// En dev, `VITE_API_URL` est relatif (`/api/v1`) : le navigateur appelle
	// l'origine locale et Vite relaie vers le backend de dev. Le backend n'échoit
	// pas `Access-Control-Allow-Origin` pour `localhost:*`, donc sans proxy le
	// CORS bloquerait toutes les requêtes du navigateur.
	server: {
		proxy: {
			"/api/v1": {
				target: "https://dev.sim.strife-cyber.org",
				changeOrigin: true,
			},
		},
	},
	plugins: [
		// devtools-vite doit rester la première entrée du tableau.
		devtools(),
		tailwindcss(),
		tanstackStart(),
		...(isVercel ? [nitro()] : []),
		viteReact(),
		babel({ presets: [reactCompilerPreset()] }),
	],
});

export default config;
