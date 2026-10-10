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
			const next = ctx.nearest(event.clientX, event.clientY);
			if (next !== hoveredId) dismissed = false;
			hoveredId = next;
		};
		// A finger leaves the plot when it lifts. The tooltip of a tap stays until the next tap.
		const onPointerLeave = (event: PointerEvent) => {
			if (event.pointerType !== 'touch') hoveredId = null;
		};
		// A finger that scrolls the page cancels its pointer: that is not a tap.
		const onPointerCancel = () => (hoveredId = null);
		// A tap out of the plot closes the tooltip of a tap.
		const onOutside = (event: PointerEvent) => {
			if (!plot.contains(event.target as Node)) hoveredId = null;
		};
		const onKeyDown = (event: KeyboardEvent) => {
			// Only a visible tooltip uses the key; otherwise a dialog around the chart gets it.
			if (event.key !== 'Escape' || !tip) return;
			event.preventDefault();
			dismissed = true;
			hoveredId = null;
		};
		plot.addEventListener('pointermove', onPointerMove);
		plot.addEventListener('pointerdown', onPointerMove);
		plot.addEventListener('pointerleave', onPointerLeave);
		plot.addEventListener('pointercancel', onPointerCancel);
		plot.addEventListener('keydown', onKeyDown);
		document.addEventListener('pointerdown', onOutside);
		return () => {
			document.removeEventListener('pointerdown', onOutside);
			plot.removeEventListener('pointerdown', onPointerMove);
			plot.removeEventListener('pointermove', onPointerMove);
			plot.removeEventListener('pointerleave', onPointerLeave);
			plot.removeEventListener('pointercancel', onPointerCancel);
			plot.removeEventListener('keydown', onKeyDown);
		};
	});

	// The figure is the containing block of the tooltip, thus the position adds the distance from
	// the padding edge of the figure to the plot. The tooltip shows only in a browser.
	const plotOffset = $derived.by(() => {
		const plot = ctx.plotElement;
		const figure = plot?.closest('figure');
		if (!tip || !plot || !figure) return [0, 0, 0];
		const a = plot.getBoundingClientRect();
		const b = figure.getBoundingClientRect();
		return [
			a.left - b.left - figure.clientLeft,
			a.top - b.top - figure.clientTop,
			figure.clientWidth
		];
	});

	// The tooltip stays in the width of the figure: near an edge, it moves away from the point.
	// Thus it does not make the page wider on a narrow screen.
	let width = $state(0);
	const left = $derived.by(() => {
		const center = plotOffset[0] + (tip?.x ?? 0);
		const half = width / 2;
		return Math.max(half, Math.min(center, plotOffset[2] - half));
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
		bind:offsetWidth={width}
		style:left="{left}px"
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
