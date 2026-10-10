<script lang="ts">
	import { resolve } from '$app/paths';
	import { ArrowRight } from '@lucide/svelte';
	import Header from '$lib/docs/components/header/header.svelte';
	import InstallCommand from '$lib/docs/components/install-command/install-command.svelte';
	import Surface from '$lib/docs/components/surface/surface.svelte';
	import Logo from '$lib/docs/components/icons/logo.svelte';
	import NpmBadge from '$lib/docs/components/npm-badge/npm-badge.svelte';
	import LandingChart from '$lib/docs/components/landing-chart/landing-chart.svelte';
	import { buttonVariants } from '$lib/docs/components/button/recipe';
	import { npmUrl, packageName, packageVersion } from '$lib/docs/package-meta.js';
	import { GITHUB_URL } from '$lib/docs/site.js';

	let { data } = $props();

	/**
	 * What the library actually gives you, in the reader's terms. Deliberately
	 * prose rather than a feature matrix: this is the only page on the site that
	 * describes the whole package, so it is also the only page that can rank for
	 * anything broader than one component's name.
	 *
	 * Written in ASD-STE100, like every other page (see CONTRIBUTING.md).
	 */
	const pitch = [
		{
			title: 'Accessibility is the primary function',
			body: 'A chart is one tab stop, and the arrow keys move the focus over the data. Each point has an accessible name with all of its values. The data table gives the same values as a table.'
		},
		{
			title: 'The parts have no styles',
			body: 'A mark draws with currentColor. Each part shows its state in data attributes: data-series, data-focused, data-focus-visible and data-selected. You write all of the CSS.'
		},
		{
			title: 'A chart is a composition of marks',
			body: 'You put a line, an area or bars on shared scales. Each mark can have its own data. The field names of the data are typed, thus an incorrect name is a type error.'
		},
		{
			title: 'No runtime dependency',
			body: 'The scales, the ticks, the paths and the stack transform are in the package. Each scale has a subpath export, and your bundler includes only the parts that you import.'
		}
	];
</script>

<!-- `GITHUB_URL` and `npmUrl` are external, so they don't go through SvelteKit's
     resolve() (which is for internal routes). -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->

<Surface level={0} class="min-h-dvh [--frame-max:1536px]">
	<div class="px-3 py-2 sm:px-8">
		<!-- `level={0}`: this page is a level-0 surface, not the docs frame, so the
		     bar has to sit at the page's own shade instead of one step above it. -->
		<Header level={0} title={packageName} githubUrl={GITHUB_URL}>
			{#snippet brand()}
				<span class="sr-only">human-kit charts</span>
				<Logo class="h-4 w-auto" />
			{/snippet}
			{#snippet actions()}
				<NpmBadge />
			{/snippet}
		</Header>
	</div>

	<main class="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8">
		<!-- The h1 is the page's one shot at saying what this is in the words a
		     reader would search for. The wordmark is already in the header, so it
		     does not repeat here. -->
		<section class="pt-16 pb-14 sm:pt-24">
			<!-- `hd-title-1` is the same serif face the docs pages give their h1 (see
			     theme.css); the hero only scales it up on wider screens. -->
			<h1 class="hd-title-1 leading-tight text-balance sm:text-4xl">
				Headless, accessible charts for Svelte 5
			</h1>
			<p class="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
				<code class="font-mono text-subtle-foreground">{packageName}</code> gives you the difficult parts
				of a chart: the scales, the geometry, the keyboard operation, the focus control and the accessible
				names. The parts have no styles. You write the design, and no part changes it.
			</p>

			<div class="mt-7 flex flex-wrap items-center gap-2">
				<a href={resolve('/docs/quick-start')} class={buttonVariants()}>
					Get started
					<ArrowRight />
				</a>
				<a href={resolve('/docs/accessibility')} class={buttonVariants({ variant: 'ghost' })}>
					Accessibility
				</a>
			</div>

			<div class="mt-8">
				<InstallCommand pkg={packageName} />
			</div>
		</section>

		<section aria-labelledby="demo" class="border-t pt-12 pb-14">
			<h2 id="demo" class="hd-title-2">Try it</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Move the focus into the chart with the Tab key. The arrow keys move the focus over the
				points, and the tooltip shows the values. Enter selects a point.
			</p>
			<div class="mt-6 rounded-xl border bg-surface p-4 sm:p-6">
				<LandingChart />
			</div>
		</section>

		<section aria-labelledby="why" class="border-t pt-12">
			<h2 id="why" class="hd-title-2">Why this library</h2>
			<dl class="mt-6 grid gap-x-8 gap-y-7 sm:grid-cols-2">
				{#each pitch as item (item.title)}
					<div>
						<dt class="text-sm font-medium text-foreground">{item.title}</dt>
						<dd class="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</dd>
					</div>
				{/each}
			</dl>
		</section>

		<section aria-labelledby="components" class="mt-14 border-t pt-12">
			<h2 id="components" class="hd-title-2">Documentation</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Each page has the live demos, the props table, and the list of the data attributes.
			</p>

			{#each data.groups as group (group.label)}
				<h3 class="mt-9 mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
					{group.label}
				</h3>
				<!-- `bg-border` behind a 1px grid gap is what draws the dividers: the cells
				     paint over it, so every seam is exactly one hairline with no borders
				     to double up where two cells meet. -->
				<ul class="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
					{#each group.items as item (item.slug)}
						<!-- A group with an odd number of pages would otherwise leave the last
						     cell empty, and an empty cell shows the list's divider colour as a
						     grey block. The odd one out spans the row instead. -->
						<li class="sm:last:odd:col-span-2">
							<a
								href={resolve(`/docs/${item.slug}`)}
								class="block h-full bg-background p-3.5 outline-hidden transition-colors hover:bg-muted focus-visible:bg-muted"
							>
								<span class="text-sm font-medium text-foreground">{item.title}</span>
								{#if item.description}
									<span
										class="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted-foreground"
									>
										{item.description}
									</span>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			{/each}
		</section>

		<footer
			class="mt-16 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-6 text-xs text-muted-foreground"
		>
			<span>The license is MIT.</span>
			<a href={GITHUB_URL} target="_blank" rel="noreferrer" class="hover:text-foreground">
				Source on GitHub
			</a>
			{#if packageVersion}
				<a href={npmUrl} target="_blank" rel="noreferrer" class="hover:text-foreground">
					{packageName} on npm
				</a>
			{/if}
		</footer>
	</main>
</Surface>
