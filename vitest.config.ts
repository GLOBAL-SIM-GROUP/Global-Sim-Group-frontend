import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const srcDir = fileURLToPath(new URL('./src', import.meta.url)).replace(
	/\\/g,
	'/',
)

export default defineConfig({
	resolve: {
		alias: [
			{ find: /^#\//, replacement: `${srcDir}/` },
			{ find: /^@\//, replacement: `${srcDir}/` },
		],
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		// `client-fiche.spec.ts` (racine) est un test Playwright (`@playwright/test`),
		// pas un test Vitest — il n'y a pas encore de `playwright.config.ts` pour le
		// lancer séparément. Exclu ici pour éviter que Vitest l'exécute et échoue
		// sur `test.describe()` (API Playwright, incompatible avec le runner Vitest).
		exclude: ['node_modules/**', 'client-fiche.spec.ts'],
	},
})
