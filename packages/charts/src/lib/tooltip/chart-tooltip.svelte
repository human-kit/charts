<script lang="ts">
	import { untrack } from 'svelte';
	import { useChartContext } from '../root/context.js';
	import type { ChartTooltipProps } from '../types.js';

	let { children, offset = 8, class: className = '', ...restProps }: ChartTooltipProps = $props();

	const ctx = useChartContext('Chart.Tooltip');

	let hoveredId: string | null = $state(null);
	// Escape closes the tooltip until the user moves to another point.
	let dismissed = $state(false);

	// The tooltip shows the point under the pointer, or the point that has the keyboard focus.
	const id = $derived(dismissed ? null : (hoveredId ?? (ctx.focus.visible ? ctx.focus.id : null)));

	/** The id of the point nearest to a position in the plot, within 40 pixels. */
	function nearest(px: number, py: number): string | null {
		let best: string | null = null;
		let distance = 40 * 40;
		for (const entry of ctx.entries) {
			entry.points.forEach((_, index) => {
				const anchor = ctx.anchor(entry.mark, entry.series, index);
				if (!anchor) return;
				const d = (anchor[0] - px) ** 2 + (anchor[1] - py) ** 2;
				if (d < distance) [best, distance] = [ctx.pointId(entry.mark, entry.series, index), d];
			});
		}
		return best;
	}

	const tip = $derived.by(() => {
		const found = ctx.locate(id);
		if (!found) return null;
		const { entry, index } = found;
		const point = entry.points[index];
		const anchor = ctx.anchor(entry.mark, entry.series, index);
		if (!anchor) return null;
		return {
			point,
			x: anchor[0],
			y: anchor[1],
			xText: ctx.formatX(ctx.toX(point.x)),
			yText: ctx.formatY(ctx.toY(point.y)),
			horizontal: entry.horizontal
		};
	});

	// A move of the focus to another point opens the tooltip again.
	$effect(() => {
		void ctx.focus.id;
		untrack(() => (dismissed = false));
	});

	$effect(() => {
		const plot = ctx.plotElement;
		if (!plot) return;
		const onPointerMove = (event: PointerEvent) => {
			const box = plot.getBoundingClientRect();
			const next = nearest(event.clientX - box.left, event.clientY - box.top);
			if (next !== hoveredId) dismissed = false;
			hoveredId = next;
		};
		const onPointerLeave = () => (hoveredId = null);
		const onKeyDown = (event: KeyboardEvent) => {
			// Only a visible tooltip uses the key; otherwise a dialog around the chart gets it.
			if (event.key !== 'Escape' || !tip) return;
			event.preventDefault();
			dismissed = true;
			hoveredId = null;
		};
		plot.addEventListener('pointermove', onPointerMove);
		plot.addEventListener('pointerleave', onPointerLeave);
		plot.addEventListener('keydown', onKeyDown);
		return () => {
			plot.removeEventListener('pointermove', onPointerMove);
			plot.removeEventListener('pointerleave', onPointerLeave);
			plot.removeEventListener('keydown', onKeyDown);
		};
	});

	// The figure is the containing block of the tooltip, thus the position adds the distance from
	// the padding edge of the figure to the plot. The tooltip shows only in a browser.
	const plotOffset = $derived.by(() => {
		const plot = ctx.plotElement;
		const figure = plot?.closest('figure');
		if (!tip || !plot || !figure) return [0, 0];
		const a = plot.getBoundingClientRect();
		const b = figure.getBoundingClientRect();
		return [a.left - b.left - figure.clientLeft, a.top - b.top - figure.clientTop];
	});
</script>

<!--
	The screen reader reads the name of the focused point, thus the tooltip does not say it again.
	The tooltip never takes the focus and never contains a control.
-->
{#if tip}
	<div
		class={className}
		aria-hidden="true"
		data-tooltip=""
		data-series={tip.point.series || undefined}
		style:position="absolute"
		style:left="{plotOffset[0] + tip.x}px"
		style:top="{plotOffset[1] + tip.y - offset}px"
		style:transform="translate(-50%, -100%)"
		style:pointer-events="none"
		{...restProps}
	>
		{#if children}
			{@render children(tip)}
		{:else}
			<!-- The category or the x value first, then the series and the value. -->
			<div data-tooltip-key="">{tip.horizontal ? tip.yText : tip.xText}</div>
			<div data-tooltip-value="">
				{#if tip.point.series}<span data-tooltip-series="">{tip.point.series}</span>{/if}
				{tip.horizontal ? tip.xText : tip.yText}
			</div>
		{/if}
	</div>
{/if}
