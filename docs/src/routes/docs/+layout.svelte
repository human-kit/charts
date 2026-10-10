<script lang="ts">
	import { DocsShell, Search } from '$lib/docs/components/index.js';
	import Logo from '$lib/docs/components/icons/logo.svelte';
	import NpmBadge from '$lib/docs/components/npm-badge/npm-badge.svelte';
	import { packageName } from '$lib/docs/package-meta.js';
	import { GITHUB_URL } from '$lib/docs/site.js';
	import { nav } from '$lib/docs/nav.js';

	let { children } = $props();
</script>

<!-- The wordmark is an aria-hidden SVG, so the hidden text gives the home link its
     accessible name. -->
<DocsShell {nav} title={packageName} githubUrl={GITHUB_URL}>
	{#snippet search()}
		<Search />
	{/snippet}
	{#snippet brand()}
		<span class="sr-only">human-kit charts</span>
		<Logo class="h-4 w-auto" />
	{/snippet}
	{#snippet actions()}
		<NpmBadge />
	{/snippet}
	{@render children()}
</DocsShell>
