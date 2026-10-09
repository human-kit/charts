<script lang="ts" generics="T">
	import { untrack } from 'svelte';
	import { read, type Channel } from '../internal/channel.js';
	import { dev } from '../internal/environment.js';
	import { round } from '../internal/path.js';
	import { stack } from '../internal/stack.js';
	import {
		useChartContext,
		type ChartPoint,
		type ChartSeries,
		type XValue
	} from '../root/context.js';
	import type { ChartBarProps } from '../types.js';

	let {
		data,
		x,
		y,
		series,
		layout = 'grouped',
		groupPadding = 0.1,
		class: className = ''
	}: ChartBarProps<T> = $props();

	const ctx = useChartContext('Chart.Bar');

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
			// A row without a value has no bar, and it takes no focus.
			if (!Number.isFinite(point.y)) return;
			let points = out.get(point.series);
			if (!points) out.set(point.series, (points = []));
			points.push(point);
		});
		return [...out].map(([name, points]) => ({ name, points }));
	});

	/** A key of an x value for the stack: the same category, date or number gives the same key. */
	const key = (value: XValue) => (typeof value === 'string' ? value : +value);

	// The bottom and the top of each bar, in data values.
	const spans = $derived(
		layout === 'stacked'
			? stack(groups.map((s) => s.points.map((p) => ({ key: key(p.x), y: p.y }))))
			: groups.map((s) => s.points.map((p): [number, number] => [0, p.y]))
	);

	// The domains must include the tops of a stack, and the data of a mark with its own data.
	const own = untrack(() => data !== undefined || x !== undefined || y !== undefined);
	const registration = ctx.register(
		() => groups as ChartSeries[],
		() => ({
			x: own ? groups.flatMap((s) => s.points.map((p) => p.x)) : undefined,
			y: layout === 'stacked' || own ? spans.flat(2) : undefined
		})
	);
	$effect(() => registration.unregister);

	$effect(() => {
		if (dev && groups.length && ctx.xScale.bandwidth === 0) {
			console.warn(
				'Chart.Bar: the x scale has no bands. Import `scaleBand` from "@human-kit/charts/scales/band" and give `xScale={{ type: scaleBand }}`.'
			);
		}
	});

	/** The value on the y scale that is nearest to zero: the bottom of a bar that starts at zero. */
	function clampToDomain(value: number) {
		const [a, b] = ctx.yScale.domain;
		return Math.min(Math.max(value, Math.min(a, b)), Math.max(a, b));
	}

	function rect(si: number, i: number, p: ChartPoint) {
		const band = ctx.xScale.bandwidth;
		const center = ctx.xScale(ctx.toX(p.x));
		let left = center - band / 2;
		let width = band;
		if (layout === 'grouped' && groups.length > 1) {
			const slot = band / groups.length;
			width = slot * (1 - groupPadding);
			left += si * slot + (slot - width) / 2;
		}
		const [bottom, top] = spans[si][i];
		const y0 = ctx.yScale(clampToDomain(bottom));
		const y1 = ctx.yScale(clampToDomain(top));
		return {
			x: round(left),
			y: round(Math.min(y0, y1)),
			width: round(Math.max(0, width)),
			height: round(Math.abs(y1 - y0))
		};
	}
</script>

<g class={className} data-mark="bar" data-layout={layout}>
	{#each groups as s, si (s.name)}
		<g role="group" aria-label={s.name || undefined} data-series={s.name || undefined}>
			{#each s.points as p, i (i)}
				<rect
					{...rect(si, i, p as ChartPoint)}
					fill="currentColor"
					data-point=""
					data-bar=""
					data-negative={p.y < 0 ? 'true' : undefined}
					{...ctx.point(registration.id, si, i, p as ChartPoint)}
				/>
			{/each}
		</g>
	{/each}
</g>
