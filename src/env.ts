import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		SERVER_URL: z.string().url().optional(),
	},

	/**
	 * The prefix that client-side variables must have. This is enforced both at
	 * a type-level and at runtime.
	 */
	clientPrefix: "VITE_",

	client: {
		/**
		 * Base URL de l'API backend (NestJS). Surchargée via `.env` (`VITE_API_URL`).
		 * Non-secret : toute valeur bundleée dans le navigateur est publique.
		 *
		 * Deux formes acceptées :
		 * - absolue (`https://host/api/v1`) — frontend hébergé séparément ;
		 * - relative (`/api/v1/api/v1`) — même origine que l'app (dev : proxy Vite vers
		 *   le backend, le CORS du backend refusant `localhost:*`).
		 */
		VITE_API_URL: z
			.string()
			.refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), {
				message: "URL absolue (https://…) ou chemin même-origine (/api/v1)",
			})
			.default("/"),
		VITE_APP_TITLE: z.string().min(1).optional(),
	},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: import.meta.env,

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,
});
