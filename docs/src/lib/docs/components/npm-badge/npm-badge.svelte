<script lang="ts">
	import Npm from '../icons/npm.svelte';
	import { buttonVariants } from '../button/recipe';
	import { npmUrl, packageName, packageVersion } from '../../package-meta.js';
</script>

<!-- The npm link, with the version. Before the first release the registry has no
     page for the package, so the badge is absent: the GitHub link in the header
     is the way to the code until then. -->
<!-- The npm href is an external URL, so it doesn't go through SvelteKit's
     resolve() (which is for internal routes). -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
{#if packageVersion}
	<a
		href={npmUrl}
		target="_blank"
		rel="noreferrer"
		aria-label="{packageName} on npm — version {packageVersion}"
		class={buttonVariants({ variant: 'ghost', size: 'sm', class: 'font-mono' })}
	>
		<Npm />
		{packageVersion}
	</a>
{/if}
