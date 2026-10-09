<script lang="ts" generics="T">
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { move } from '../internal/navigation.js';
	import { isFocusVisible, onModalityChange } from '../internal/modality.js';
	import { read } from '../internal/channel.js';
	import { dev } from '../internal/environment.js';
	import { scaleLinear } from '../scales/linear.js';
	import type { Scale } from '../scales/types.js';
	import type { ChartRootProps, ScaleOptions, ValueFormat } from '../types.js';
	import {
		setChartContext,
		type ChartContext,
		type ChartMargin,
		type ChartPoint,
		type ChartSeries,
		type ChartTick
	} from './context.js';

	const generatedId = $props.id();

	let {
		id: idProp,
		data = [],
		x,
		y,
		series,
		xScale: xScaleOptions,
		yScale: yScaleOptions,
		width: widthProp,
		height = 300,
		margin: marginProp,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars -- bindable: the parent reads it.
		focused = $bindable(null),
		onSelect,
		locale,
		xFormat,
		yFormat,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		'aria-describedby': ariaDescribedBy,
		children,
		class: className = '',
		// eslint-disable-next-line @typescript-eslint/no-unused-vars -- bindable: the parent reads it.
		element = $bindable<HTMLElement | null>(null),
		context = $bindable(),
		...restProps
	}: ChartRootProps<T> = $props();

	const instanceId = untrack(() => idProp) ?? generatedId;

	/** The width of the SVG before the first measure, on the server and at hydration. */
	const DEFAULT_WIDTH = 640;
	let measuredWidth = $state(0);
	const width = $derived(widthProp ?? (measuredWidth || DEFAULT_WIDTH));

	// The space that each axis needs for its labels. The largest need of a side is its margin.
	const SIDES = ['top', 'right', 'bottom', 'left'] as const;
	const MIN_MARGIN = 8;
	const reserved = new SvelteMap<string, Partial<ChartMargin>>();
	let reserveCount = 0;
	const margin = $derived.by(() => {
		const out: ChartMargin = { top: 0, right: 0, bottom: 0, left: 0 };
		for (const side of SIDES) {
			let size = MIN_MARGIN;
			for (const needs of reserved.values()) size = Math.max(size, Math.ceil(needs[side] ?? 0));
			out[side] = marginProp?.[side] ?? size;
		}
		return out;
	});

	// The marks, in mount order. The order of the marks is the order of the series for the keyboard.
	type Mark = { read: () => ChartSeries[]; own: boolean };
	const marks = new SvelteMap<string, Mark>();
	let markCount = 0;

	type Entry = { mark: string; series: number; points: ChartPoint[] };
	const entries = $derived.by(() => {
		const out: Entry[] = [];
		for (const [mark, { read }] of marks) {
			read().forEach((s, index) => {
				if (s.points.length) out.push({ mark, series: index, points: s.points });
			});
		}
		return out;
	});

	function pointId(mark: string, series: number, index: number) {
		return `chart-${instanceId}-${mark}-${series}-${index}`;
	}

	// The id of each point to its place in `entries`.
	const positions = $derived.by(() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a lookup made in one pass, not state.
		const map = new Map<string, { series: number; index: number }>();
		entries.forEach((entry, s) =>
			entry.points.forEach((_, index) =>
				map.set(pointId(entry.mark, entry.series, index), { series: s, index })
			)
		);
		return map;
	});

	// The values of the domains. On a server, a `$derived` keeps the value of its first read, and
	// the parts read it in markup order. Thus the values of the root come from its own props, which
	// are complete before the first part starts. Only a mark with data or channels of its own adds
	// values through its registration.
	const rootValues = $derived.by(() => {
		const xs: number[] = [];
		const ys: number[] = [];
		if (x && y) {
			data.forEach((row, index) => {
				const xv = +read(x, row, index);
				const yv = +read(y, row, index);
				if (!Number.isFinite(xv) || !Number.isFinite(yv)) return;
				xs.push(xv);
				ys.push(yv);
			});
		}
		return { xs, ys };
	});
	const ownPoints = $derived(
		[...marks.values()].filter((m) => m.own).flatMap((m) => m.read().flatMap((s) => s.points))
	);
	const xValues = $derived([...rootValues.xs, ...ownPoints.map((p) => +p.x)]);
	const yValues = $derived([...rootValues.ys, ...ownPoints.map((p) => p.y)]);
	const firstX = $derived(data.length && x ? read(x, data[0], 0) : ownPoints[0]?.x);

	/** About one tick for each 80 pixels of a horizontal axis, and each 40 of a vertical one. */
	function tickCount(range: readonly [number, number], spacing: number) {
		return Math.max(2, Math.round(Math.abs(range[1] - range[0]) / spacing));
	}

	function makeScale(
		options: ScaleOptions | undefined,
		values: number[],
		range: [number, number],
		count: number,
		niceDefault: boolean
	): Scale {
		const type = options?.type ?? scaleLinear;
		const given = options?.domain;
		const domain: [number, number] = given
			? [+given[0], +given[1]]
			: values.length
				? [Math.min(...values), Math.max(...values)]
				: [0, 1];
		const scale = type(domain, range);
		return (options?.nice ?? niceDefault) ? type(scale.nice(count), range) : scale;
	}

	const xRange = $derived<[number, number]>([margin.left, width - margin.right]);
	const yRange = $derived<[number, number]>([height - margin.bottom, margin.top]);
	const xCount = $derived(tickCount(xRange, 80));
	const yCount = $derived(tickCount(yRange, 40));
	const xScale = $derived(makeScale(xScaleOptions, xValues, xRange, xCount, false));
	const yScale = $derived(makeScale(yScaleOptions, yValues, yRange, yCount, true));

	$effect(() => {
		if (dev && firstX instanceof Date && xScale.kind !== 'time') {
			console.warn(
				'Chart.Root: the x values are dates, but the x scale is not a time scale. Import `scaleTime` from "@human-kit/charts/scales/time" and give `xScale={{ type: scaleTime }}`.'
			);
		}
	});

	function valueFormatter(scale: Scale, values: number[], format: ValueFormat | undefined) {
		if (typeof format === 'function') {
			return (value: number) => format(scale.kind === 'time' ? new Date(value) : value);
		}
		return scale.valueFormat(values, locale, format);
	}

	const xValueFormat = $derived(valueFormatter(xScale, xValues, xFormat));
	const yValueFormat = $derived(valueFormatter(yScale, yValues, yFormat));

	function makeTicks(
		scale: Scale,
		count: number,
		format: ValueFormat | undefined,
		full: (value: number) => string
	): ChartTick[] {
		// A format from the consumer is also the format of the ticks.
		const label = format ? full : scale.tickFormat(count, locale);
		return scale
			.ticks(count)
			.map((value) => ({ value, position: scale(value), label: label(value) }));
	}

	const xTicks = $derived(makeTicks(xScale, xCount, xFormat, xValueFormat));
	const yTicks = $derived(makeTicks(yScale, yCount, yFormat, yValueFormat));

	/** The accessible name of a point: the x value, the series and the y value. */
	function pointLabel(point: ChartPoint) {
		const parts = [xValueFormat(+point.x)];
		if (point.series) parts.push(point.series);
		parts.push(yValueFormat(point.y));
		return parts.join(', ');
	}

	// The point that has the tab stop. Without a valid one, the first point has it.
	let activeId: string | null = $state(null);
	const tabStopId = $derived.by(() => {
		if (activeId && positions.has(activeId)) return activeId;
		const first = entries[0];
		return first ? pointId(first.mark, first.series, 0) : null;
	});
	let focusedId: string | null = $state(null);
	let focusVisible = $state(false);

	function pointAt(id: string | null): ChartPoint | null {
		const position = id ? positions.get(id) : undefined;
		return position ? entries[position.series].points[position.index] : null;
	}

	function targetId(event: Event) {
		const id = (event.target as Element | null)?.id;
		return id && positions.has(id) ? id : null;
	}

	function select(id: string) {
		const point = pointAt(id);
		if (point) onSelect?.(point as ChartPoint<T>);
	}

	$effect(() => {
		if (!focusedId) return;
		const id = focusedId;
		return onModalityChange(() => {
			focusVisible = isFocusVisible(document.getElementById(id));
		});
	});

	const plotHandlers: ChartContext['plotHandlers'] = {
		onkeydown(event) {
			const id = targetId(event);
			if (!id) return;
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				select(id);
				return;
			}
			const next = move(
				entries.map((e) => e.points.map((p) => +p.x)),
				positions.get(id)!,
				event.key
			);
			if (!next) return;
			event.preventDefault();
			const entry = entries[next.series];
			const nextId = pointId(entry.mark, entry.series, next.index);
			activeId = nextId;
			document.getElementById(nextId)?.focus();
		},
		onfocusin(event) {
			const id = targetId(event);
			if (!id) return;
			activeId = id;
			focusedId = id;
			focusVisible = isFocusVisible(event.target as Element);
			focused = pointAt(id) as ChartPoint<T> | null;
		},
		onfocusout(event) {
			const next = event.relatedTarget as Node | null;
			if (next && (event.currentTarget as Node).contains(next)) return;
			focusedId = null;
			focusVisible = false;
			focused = null;
		},
		onclick(event) {
			const id = targetId(event);
			if (id) select(id);
		}
	};

	let titleId: string | null = $state(null);
	// A name from the root wins over the title, as `aria-label` wins over `aria-labelledby`.
	const labels = $derived({
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabel ? undefined : (ariaLabelledBy ?? titleId ?? undefined),
		'aria-describedby': ariaDescribedBy
	});

	const ctx: ChartContext = {
		instanceId,
		get data() {
			return data;
		},
		get x() {
			return x;
		},
		get y() {
			return y;
		},
		get series() {
			return series;
		},
		get width() {
			return width;
		},
		get height() {
			return height;
		},
		get margin() {
			return margin;
		},
		get xScale() {
			return xScale;
		},
		get yScale() {
			return yScale;
		},
		get xTicks() {
			return xTicks;
		},
		get yTicks() {
			return yTicks;
		},
		reserve(needs) {
			const id = `a${reserveCount++}`;
			reserved.set(id, needs);
			return {
				update(next) {
					const last = reserved.get(id);
					// A change below one pixel does not count: it stops a loop of measures.
					const same =
						last && SIDES.every((side) => Math.abs((last[side] ?? 0) - (next[side] ?? 0)) < 1);
					if (!same) reserved.set(id, next);
				},
				unregister: () => reserved.delete(id)
			};
		},
		get titleId() {
			return titleId;
		},
		set titleId(value) {
			titleId = value;
		},
		register(read, own) {
			const id = `m${markCount++}`;
			marks.set(id, { read, own });
			return { id, unregister: () => marks.delete(id) };
		},
		point(mark, s, index, point) {
			const id = pointId(mark, s, index);
			return {
				id,
				role: 'img',
				tabindex: id === tabStopId ? 0 : -1,
				'aria-label': pointLabel(point),
				'data-focused': id === focusedId ? 'true' : undefined,
				'data-focus-visible': id === focusedId && focusVisible ? 'true' : undefined
			};
		},
		get labels() {
			return labels;
		},
		plotHandlers
	};

	setChartContext(ctx);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- bindable: the parent reads it.
	context = ctx;

	$effect(() => {
		element = rootRef;
	});
	let rootRef: HTMLElement | null = $state(null);
</script>

<figure
	bind:this={rootRef}
	bind:clientWidth={measuredWidth}
	id="chart-{instanceId}"
	class={className}
	data-chart=""
	data-focus-within={focusedId ? 'true' : undefined}
	data-focus-visible={focusVisible ? 'true' : undefined}
	{...restProps}
>
	{@render children?.()}
</figure>
