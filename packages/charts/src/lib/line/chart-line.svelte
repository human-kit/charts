<script lang="ts" generics="T">
	import { untrack } from 'svelte';
	import { read, type Channel } from '../internal/channel.js';
	import { linePath, round } from '../internal/path.js';
	import { useChartContext, type ChartPoint, type ChartSeries } from '../root/context.js';
	import type { ChartLineProps } from '../types.js';

	let { data, x, y, series, r = 3, class: className = '' }: ChartLineProps<T> = $props();

	const ctx = useChartContext('Chart.Line');

	const groups = $derived.by(() => {
		const rows = (data ?? ctx.data) as readonly T[];
		const xc = (x ?? ctx.x) as Channel<T, number | Date> | undefined;
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
			// A point without a value is a gap in the line, and it takes no focus.
			if (!Number.isFinite(+point.x) || !Number.isFinite(point.y)) return;
			let points = out.get(point.series);
			if (!points) out.set(point.series, (points = []));
			points.push(point);
		});
		return [...out].map(([name, points]) => ({ name, points }));
	});

	const registration = ctx.register(
		() => groups as ChartSeries[],
		untrack(() => data !== undefined || x !== undefined || y !== undefined)
	);
	$effect(() => registration.unregister);
</script>

<g class={className} data-mark="line">
	{#each groups as s, si (s.name)}
		<g role="group" aria-label={s.name || undefined} data-series={s.name || undefined}>
			<path
				d={linePath(s.points.map((p) => [ctx.xScale(+p.x), ctx.yScale(p.y)]))}
				fill="none"
				stroke="currentColor"
				aria-hidden="true"
				data-line=""
			/>
			{#each s.points as p, i (i)}
				<circle
					cx={round(ctx.xScale(+p.x))}
					cy={round(ctx.yScale(p.y))}
					{r}
					fill="currentColor"
					data-point=""
					{...ctx.point(registration.id, si, i, p as ChartPoint)}
				/>
			{/each}
		</g>
	{/each}
</g>
