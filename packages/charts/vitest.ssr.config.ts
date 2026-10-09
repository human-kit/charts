import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	test: {
		include: ['src/**/*-ssr.test.ts'],
		globals: true,
		environment: 'node',
		alias: {
			$lib: resolve(__dirname, './src/lib')
		}
	}
});
