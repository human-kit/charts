<script lang="ts" generics="T">
	import { untrack } from 'svelte';
	import { read, type Channel } from '../internal/channel.js';
	import { areaPath, linePath, round } from '../internal/path.js';
	import { stack } from '../internal/stack.js';
	import {
		useChartContext,
		type ChartPoint,
		type ChartSeries,
		type XValue
	} from '../root/context.js';
	import type { ChartAreaProps } from '../types.js';

	let {
		data,
		x,
		y,
		series,
		stacked = false,
		r = 0,
		focusRadius = 4,
		class: className = ''
	}: ChartAreaProps<T> = $props();

	const ctx = useChartContext('Chart.Area');

	const groups = $derived.by(() => {
		const rows = (data ?? ctx.data) as readonly T[];
		const xc = (x ?? ctx.x) as Channel<T, XValue> | undefined;
		const yc = (y ?? ctx.y) as Channel<T, number> | undefined;
		const sc = (series ?? ctx.series) as Channel<T, string> | undefined;
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a scratch map for one pass.
		const out = new Map<string, ChartPoint<T>[]>();
		if (!xc || !yc) return [] as ChartSeries<T>[];
		rows.forEach((datum, index) => {
			const point = {
				datum,
				index,
				series: sc ? String(read(sc, datum, index)) : '',
				x: read(xc, datum, index),
				y: Number(read(yc, datum, index))
			};
			const xOk = typeof point.x === 'string' || Number.isFinite(+point.x);
			if (!xOk || !Number.isFinite(point.y)) return;
			let points = out.get(point.series);
			if (!points) out.set(point.series, (points = []));
			points.push(point);
		});
		return [...out].map(([name, points]) => ({ name, points }));
	});

	const key = (value: XValue) => (typeof value === 'string' ? value : +value);

	// The bottom and the top of the area at each point, in data values.
	const spans = $derived(
		stacked
			? stack(groups.map((s) => s.points.map((p) => ({ key: key(p.x), y: p.y }))))
			: groups.map((s) => s.points.map((p): [number, number] => [0, p.y]))
	);

	/** The value on the y scale nearest to `value`: an area does not go below the plot. */
	function clamp(value: number) {
		const [a, b] = ctx.yScale.domain;
		return Math.min(Math.max(value, Math.min(a, b)), Math.max(a, b));
	}

	function position(si: number, i: number, end: 0 | 1): [number, number] {
		const p = groups[si].points[i];
		return [ctx.xScale(ctx.toX(p.x)), ctx.yScale(clamp(spans[si][i][end]))];
	}

	const own = untrack(() => data !== undefined || x !== undefined || y !== undefined);
	const registration = ctx.register({
		read: () => groups as ChartSeries[],
		extent: () => ({
			x: own ? groups.flatMap((s) => s.points.map((p) => p.x)) : undefined,
			y: stacked || own ? spans.flat(2) : undefined
		}),
		anchor: (si, i) => position(si, i, 1)
	});
	$effect(() => registration.unregister);
</script>

<g class={className} data-mark="area" data-stacked={stacked ? 'true' : undefined}>
	{#each groups as s, si (s.name)}
		{@const top = s.points.map((_, i) => position(si, i, 1))}
		{@const bottom = s.points.map((_, i) => position(si, i, 0))}
		<g role="group" aria-label={s.name || undefined} data-series={s.name || undefined}>
			<path d={areaPath(top, bottom)} fill="currentColor" aria-hidden="true" data-area="" />
			<path d={linePath(top)} fill="none" stroke="currentColor" aria-hidden="true" data-line="" />
			{#each s.points as p, i (i)}
				{@const attributes = ctx.point(registration.id, si, i, p as ChartPoint)}
				<!-- A point is hidden by default, and it grows when it has the focus. -->
				<circle
					cx={round(top[i][0])}
					cy={round(top[i][1])}
					r={attributes['data-focused'] ? Math.max(r, focusRadius) : r}
					fill="currentColor"
					data-point=""
					{...attributes}
				/>
			{/each}
		</g>
	{/each}
</g>
