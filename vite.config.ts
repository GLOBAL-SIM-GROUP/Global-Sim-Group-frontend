import { paraglideVitePlugin } from "@inlang/paraglide-js";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	// En dev, `VITE_API_URL` est relatif (`/api/v1`) : le navigateur appelle
	// l'origine locale et Vite relaie vers le backend de dev. Le backend n'échoit
	// pas `Access-Control-Allow-Origin` pour `localhost:*`, donc sans proxy le
	// CORS bloquerait toutes les requêtes du navigateur.
	server: {
		proxy: {
			"/api": {
				target: "https://dev.sim.strife-cyber.org",
				changeOrigin: true,
			},
		},
	},
	plugins: [
		// devtools-vite doit rester la première entrée du tableau.
		devtools(),
		// Compile messages/i18n à la volée. Options volontairement identiques
		// à `npm run i18n:compile` (sortie committable + .d.ts pour typecheck).
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/paraglide",
			strategy: ["globalVariable", "baseLocale"],
			emitTsDeclarations: true,
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		babel({ presets: [reactCompilerPreset()] }),
	],
});

export default config;
