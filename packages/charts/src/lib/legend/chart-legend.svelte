<script lang="ts">
	import { useChartContext } from '../root/context.js';
	import type { ChartLegendProps } from '../types.js';

	let { children, class: className = '', ...restProps }: ChartLegendProps = $props();

	const ctx = useChartContext('Chart.Legend');
	// The names in the order of the marks, without duplicates. One series without a name has
	// nothing to show.
	const names = $derived(
		[...new Set(ctx.marks.flatMap((mark) => mark.read().map((s) => s.name)))].filter(Boolean)
	);
</script>

<!-- The names of the points also give the series, thus the legend is decoration. -->
{#if names.length}
	<ul class={className} aria-hidden="true" data-legend="" {...restProps}>
		{#each names as name, index (name)}
			<li data-series={name} data-legend-item="">
				{#if children}
					{@render children({ name, index })}
				{:else}
					<span data-swatch=""></span>
					{name}
				{/if}
			</li>
		{/each}
	</ul>
{/if}
