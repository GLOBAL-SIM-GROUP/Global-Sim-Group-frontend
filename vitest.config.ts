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
	},
})
