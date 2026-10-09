<script lang="ts">
	import { useChartContext } from '../root/context.js';
	import type { ChartPlotProps } from '../types.js';

	let {
		children,
		class: className = '',
		element = $bindable<SVGSVGElement | null>(null),
		...restProps
	}: ChartPlotProps = $props();

	const ctx = useChartContext('Chart.Plot');
</script>

<!-- The handlers act on the focused point: the points are the interactive elements. -->
<svg
	bind:this={element}
	class={className}
	width={ctx.width}
	height={ctx.height}
	viewBox="0 0 {ctx.width} {ctx.height}"
	role="group"
	aria-roledescription="chart"
	{...ctx.labels}
	data-plot=""
	{...restProps}
	{...ctx.plotHandlers}
>
	{@render children?.()}
</svg>
