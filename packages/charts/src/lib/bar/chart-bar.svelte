<script lang="ts" generics="T">
	import { untrack } from 'svelte';
	import type { Channel } from '../internal/channel.js';
	import { dev } from '../internal/environment.js';
	import { round } from '../internal/path.js';
	import { groupRows, stackKey } from '../internal/series.js';
	import { stack } from '../internal/stack.js';
	import {
		useChartContext,
		type ChartPoint,
		type ChartSeries,
		type ChartValue
	} from '../root/context.js';
	import type { ChartBarProps } from '../types.js';

	let {
		data,
		x,
		y,
		series,
		name,
		layout = 'grouped',
		groupPadding = 0.1,
		class: className = ''
	}: ChartBarProps<T> = $props();

	const ctx = useChartContext('Chart.Bar');

	const groups = $derived(
		groupRows(
			(data ?? ctx.data) as readonly T[],
			(x ?? ctx.x) as Channel<T, ChartValue> | undefined,
			(y ?? ctx.y) as Channel<T, ChartValue> | undefined,
			(series ?? ctx.series) as Channel<T, string> | undefined,
			name
		)
	);

	// Categories on the y axis make horizontal bars: the bars grow along x. The data decides, not
	// the scale, thus the server knows it before the scales exist.
	const horizontal = $derived(typeof groups[0]?.points[0]?.y === 'string');
	const category = (p: ChartPoint<T>) => (horizontal ? p.y : p.x);
	const value = (p: ChartPoint<T>) => +(horizontal ? p.x : p.y);

	// The start and the end of each bar, in data values.
	const spans = $derived(
		layout === 'stacked'
			? stack(
					groups.map((s) => s.points.map((p) => ({ key: stackKey(category(p)), y: value(p) }))),
					!horizontal
				)
			: groups.map((s) => s.points.map((p): [number, number] => [0, value(p)]))
	);

	// The domains must include the ends of a stack, and the data of a mark with its own data.
	const own = untrack(() => data !== undefined || x !== undefined || y !== undefined);
	const registration = ctx.register({
		read: () => groups as ChartSeries[],
		extent() {
			const categories = own ? groups.flatMap((s) => s.points.map(category)) : undefined;
			const values = layout === 'stacked' || own ? spans.flat(2) : undefined;
			return horizontal ? { x: values, y: categories } : { x: categories, y: values };
		},
		// The tooltip points at the middle of the end of the bar.
		anchor(si, i) {
			const box = rect(si, i, groups[si].points[i]);
			const positive = value(groups[si].points[i]) >= 0;
			return horizontal
				? [positive ? box.x + box.width : box.x, box.y + box.height / 2]
				: [box.x + box.width / 2, positive ? box.y : box.y + box.height];
		},
		horizontal: () => horizontal
	});
	$effect(() => registration.unregister);

	const bandScale = $derived(horizontal ? ctx.yScale : ctx.xScale);
	const valueScale = $derived(horizontal ? ctx.xScale : ctx.yScale);

	$effect(() => {
		if (dev && groups.length && bandScale.bandwidth === 0) {
			const axis = horizontal ? 'y' : 'x';
			console.warn(
				`Chart.Bar: the ${axis} scale has no bands. Import \`scaleBand\` from "@human-kit/charts/scales/band" and give \`${axis}Scale={{ type: scaleBand }}\`.`
			);
		}
	});

	/** The value on the value scale nearest to `v`: a bar does not go out of the plot. */
	function clamp(v: number) {
		const [a, b] = valueScale.domain;
		return Math.min(Math.max(v, Math.min(a, b)), Math.max(a, b));
	}

	function rect(si: number, i: number, p: ChartPoint<T>) {
		const band = bandScale.bandwidth;
		const center = bandScale(horizontal ? ctx.toY(p.y) : ctx.toX(p.x));
		let start = center - band / 2;
		let size = band;
		if (layout === 'grouped' && groups.length > 1) {
			const slot = band / groups.length;
			size = slot * (1 - groupPadding);
			start += si * slot + (slot - size) / 2;
		}
		const [from, to] = spans[si][i];
		const a = valueScale(clamp(from));
		const b = valueScale(clamp(to));
		const across = { start: round(start), size: round(Math.max(0, size)) };
		const along = { start: round(Math.min(a, b)), size: round(Math.abs(b - a)) };
		return horizontal
			? { x: along.start, y: across.start, width: along.size, height: across.size }
			: { x: across.start, y: along.start, width: across.size, height: along.size };
	}
</script>

<g
	class={className}
	data-mark="bar"
	data-layout={layout}
	data-orientation={horizontal ? 'horizontal' : 'vertical'}
>
	{#each groups as s, si (s.name)}
		<g role="group" aria-label={s.name || undefined} data-series={s.name || undefined}>
			{#each s.points as p, i (i)}
				<rect
					{...rect(si, i, p)}
					fill="currentColor"
					data-point=""
					data-bar=""
					data-negative={value(p) < 0 ? 'true' : undefined}
					{...ctx.point(registration.id, si, i, p as ChartPoint)}
				/>
			{/each}
		</g>
	{/each}
</g>
