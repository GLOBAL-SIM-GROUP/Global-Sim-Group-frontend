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
		// Les tests de formulaires pilotés par userEvent durent plusieurs
		// secondes chacun ; 5 s (défaut) est trop juste sur machine chargée —
		// échecs intermittents constatés (timeout, pas assertion).
		testTimeout: 20000,
		// Les `*.spec.ts` (racine) sont des tests Playwright (`@playwright/test`),
		// pas des tests Vitest — il n'y a pas de `playwright.config.ts` pour les
		// lancer séparément. Exclus ici pour éviter que Vitest les exécute et
		// échoue sur `test.describe()` (API Playwright, runner incompatible).
		exclude: ['node_modules/**', '*.spec.ts'],
	},
})
