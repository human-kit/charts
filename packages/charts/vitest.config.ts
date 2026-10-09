import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'path';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['src/**/*-ssr.test.ts'],
		globals: true,
		// One file at a time: parallel files run in iframes that the browser throttles, and the
		// focus moves between them.
		fileParallelism: false,
		alias: {
			$lib: resolve(__dirname, './src/lib')
		},
		browser: {
			enabled: true,
			provider: playwright(),
			instances: [{ browser: 'chromium' }],
			headless: true,
			screenshotFailures: false
		}
	}
});
