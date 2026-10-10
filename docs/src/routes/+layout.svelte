<script lang="ts">
	import '@fontsource-variable/geist';
	import '@fontsource-variable/roboto-serif';
	import '../app.css';
	import { dev } from '$app/environment';
	import { RenderScan } from 'svelte-render-scan';
	import Seo from '$lib/docs/components/seo/seo.svelte';
	let { children } = $props();
</script>

<!-- The site's only head block. Routes describe themselves by returning `seo`
     from their `load` (see $lib/docs/seo.ts); pages never emit <title>/<meta>
     of their own, because Svelte dedupes the former and not the latter. -->
<Seo />

{#if dev}
	<RenderScan />
{/if}

{@render children()}
