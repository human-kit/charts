<script lang="ts" generics="T">
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { move } from '../internal/navigation.js';
	import { isFocusVisible, onModalityChange } from '../internal/modality.js';
	import { read } from '../internal/channel.js';
	import { dev } from '../internal/environment.js';
	import { isValue } from '../internal/series.js';
	import { scaleLinear } from '../scales/linear.js';
	import type { Scale } from '../scales/types.js';
	import type { ChartRootProps, ScaleOptions, ValueFormat } from '../types.js';
	import {
		setChartContext,
		type ChartContext,
		type ChartEntry,
		type ChartMargin,
		type ChartMark,
		type ChartPoint,
		type ChartTick,
		type ChartValue
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
		selected = $bindable(null),
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
	const fluid = $derived(widthProp === undefined && !measuredWidth);

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

	// The marks, in mount order. The series names in the order of their first appearance in the
	// marks are the order of the legend.
	const marks = new SvelteMap<string, ChartMark>();
	let markCount = 0;

	const entries = $derived.by(() => {
		const out: ChartEntry[] = [];
		for (const [mark, m] of marks) {
			const horizontal = m.horizontal?.() ?? false;
			m.read().forEach((s, index) => {
				if (s.points.length) out.push({ mark, series: index, points: s.points, horizontal });
			});
		}
		// The keyboard goes through the series in the order of the legend: the series of the same
		// name in two marks come one after the other. The sort is stable, thus the marks keep their order.
		const order = [...new Set(out.map((entry) => entry.points[0].series))];
		return out.sort(
			(a, b) => order.indexOf(a.points[0].series) - order.indexOf(b.points[0].series)
		);
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
	// are complete before the first part starts. Only a mark with data or channels of its own, or a
	// stack, adds values through its registration.
	const rootValues = $derived.by(() => {
		const xs: ChartValue[] = [];
		const ys: ChartValue[] = [];
		if (x && y) {
			data.forEach((row, index) => {
				const xv = read(x, row, index);
				const yv = read(y, row, index);
				if (!isValue(xv) || !isValue(yv)) return;
				xs.push(xv);
				ys.push(yv);
			});
		}
		return { xs, ys };
	});
	const extents = $derived([...marks.values()].flatMap((m) => (m.extent ? [m.extent()] : [])));
	const rawX = $derived([...rootValues.xs, ...extents.flatMap((e) => e.x ?? [])]);
	const rawY = $derived([...rootValues.ys, ...extents.flatMap((e) => e.y ?? [])]);

	/** The categories of a channel, in the order of their first appearance, with their indexes. */
	function categoriesOf(values: ChartValue[]) {
		const names = [...new Set(values.filter((v): v is string => typeof v === 'string'))];
		return { names, index: new Map(names.map((name, i) => [name, i])) };
	}
	const xCategories = $derived(categoriesOf(rawX));
	const yCategories = $derived(categoriesOf(rawY));

	/** A value as a number: a date is its time, and a category is its index. */
	function toNumber(value: ChartValue, categories: { index: Map<string, number> }) {
		return typeof value === 'string' ? (categories.index.get(value) ?? NaN) : +value;
	}
	const toX = (value: ChartValue) => toNumber(value, xCategories);
	const toY = (value: ChartValue) => toNumber(value, yCategories);
	const xValues = $derived(rawX.map(toX));
	const yValues = $derived(rawY.map(toY));

	/** About one tick for each 80 pixels of a horizontal axis, and each 40 of a vertical one. */
	function tickCount(range: readonly [number, number], spacing: number) {
		return Math.max(2, Math.round(Math.abs(range[1] - range[0]) / spacing));
	}

	function makeScale(
		options: ScaleOptions | undefined,
		values: number[],
		range: [number, number],
		count: number,
		categories: readonly string[],
		defaults: { nice: boolean; zero: boolean }
	): Scale {
		const type = options?.type ?? scaleLinear;
		const given = options?.domain;
		let domain: [number, number] = given
			? [+given[0], +given[1]]
			: values.length
				? [Math.min(...values), Math.max(...values)]
				: [0, 1];
		if (!given && (options?.zero ?? defaults.zero)) {
			domain = [Math.min(domain[0], 0), Math.max(domain[1], 0)];
		}
		const settings = { categories, padding: options?.padding };
		const scale = type(domain, range, settings);
		return (options?.nice ?? defaults.nice) ? type(scale.nice(count), range, settings) : scale;
	}

	// Categories on one axis make a bar chart likely, thus the other axis starts at zero. A vertical
	// axis of categories goes from the top down, in the order of reading.
	const yCategorical = $derived(yCategories.names.length > 0);
	const xRange = $derived<[number, number]>([margin.left, width - margin.right]);
	const yRange = $derived<[number, number]>(
		yCategorical ? [margin.top, height - margin.bottom] : [height - margin.bottom, margin.top]
	);
	const xCount = $derived(tickCount(xRange, 80));
	const yCount = $derived(tickCount(yRange, 40));
	const xScale = $derived(
		makeScale(xScaleOptions, xValues, xRange, xCount, xCategories.names, {
			nice: yCategorical,
			zero: yCategorical
		})
	);
	const yScale = $derived(
		makeScale(yScaleOptions, yValues, yRange, yCount, yCategories.names, {
			nice: !yCategorical,
			zero: !yCategorical
		})
	);

	$effect(() => {
		if (!dev) return;
		for (const [axis, raw, scale] of [
			['x', rawX[0], xScale],
			['y', rawY[0], yScale]
		] as const) {
			if (raw instanceof Date && scale.kind !== 'time') {
				console.warn(
					`Chart.Root: the ${axis} values are dates, but the ${axis} scale is not a time scale. Import \`scaleTime\` from "@human-kit/charts/scales/time" and give \`${axis}Scale={{ type: scaleTime }}\`.`
				);
			}
			if (typeof raw === 'string' && scale.kind !== 'band') {
				console.warn(
					`Chart.Root: the ${axis} values are categories, but the ${axis} scale is not a band scale. Import \`scaleBand\` from "@human-kit/charts/scales/band" and give \`${axis}Scale={{ type: scaleBand }}\`.`
				);
			}
		}
	});

	function valueFormatter(
		scale: Scale,
		values: number[],
		categories: readonly string[],
		format: ValueFormat | undefined
	) {
		if (typeof format === 'function') {
			return (value: number) =>
				format(
					scale.kind === 'time'
						? new Date(value)
						: scale.kind === 'band'
							? categories[value]
							: value
				);
		}
		return scale.valueFormat(values, locale, format);
	}

	const xValueFormat = $derived(valueFormatter(xScale, xValues, xCategories.names, xFormat));
	const yValueFormat = $derived(valueFormatter(yScale, yValues, yCategories.names, yFormat));

	function makeTicks(
		scale: Scale,
		count: number,
		format: ValueFormat | undefined,
		full: (value: number) => string
	): ChartTick[] {
		// A format from the consumer is also the format of the ticks.
		const label = format ? full : scale.tickFormat(count, locale);
		// A category is a name, not a step on a line: show each one while they have 32 pixels.
		if (scale.kind === 'band') count = tickCount(scale.range, 32);
		return scale
			.ticks(count)
			.map((value) => ({ value, position: scale(value), label: label(value) }));
	}

	const xTicks = $derived(makeTicks(xScale, xCount, xFormat, xValueFormat));
	const yTicks = $derived(makeTicks(yScale, yCount, yFormat, yValueFormat));

	/**
	 * The accessible name of a point: the category or the x value first, then the series and the
	 * value.
	 */
	function pointLabel(point: ChartPoint, horizontal: boolean) {
		const xText = xValueFormat(toX(point.x));
		const yText = yValueFormat(toY(point.y));
		const parts = horizontal ? [yText] : [xText];
		if (point.series) parts.push(point.series);
		parts.push(horizontal ? xText : yText);
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
	let plotElement: SVGSVGElement | null = $state(null);

	function locate(id: string | null) {
		const position = id ? positions.get(id) : undefined;
		return position ? { entry: entries[position.series], index: position.index } : null;
	}

	function pointAt(id: string | null): ChartPoint | null {
		const found = locate(id);
		return found ? found.entry.points[found.index] : null;
	}

	/**
	 * Whether the point is the selected point: the same row index and series. The test does not use
	 * the identity of the row, because a parent that holds `selected` in a `$state` gets a proxy of
	 * it, and a proxy is not equal to its row.
	 */
	function isSelected(point: ChartPoint) {
		return !!selected && selected.index === point.index && selected.series === point.series;
	}

	function targetId(event: Event) {
		const id = (event.target as Element | null)?.id;
		return id && positions.has(id) ? id : null;
	}

	/**
	 * The id of the point nearest to a position on the screen, within 40 pixels. A point can be
	 * small, thus a pointer or a finger near it is enough.
	 */
	function nearest(clientX: number, clientY: number): string | null {
		if (!plotElement) return null;
		const box = plotElement.getBoundingClientRect();
		const [px, py] = [clientX - box.left, clientY - box.top];
		let best: string | null = null;
		let distance = 40 * 40;
		for (const entry of entries) {
			const mark = marks.get(entry.mark);
			entry.points.forEach((_, index) => {
				const anchor = mark?.anchor(entry.series, index);
				if (!anchor) return;
				const d = (anchor[0] - px) ** 2 + (anchor[1] - py) ** 2;
				if (d < distance) [best, distance] = [pointId(entry.mark, entry.series, index), d];
			});
		}
		return best;
	}

	/** Selects the point, or clears the selection when the point is already selected. */
	function select(id: string) {
		const point = pointAt(id) as ChartPoint<T> | null;
		if (!point) return;
		selected = isSelected(point) ? null : point;
		onSelect?.(point);
	}

	$effect(() => {
		if (!focusedId) return;
		const id = focusedId;
		return onModalityChange(() => {
			focusVisible = isFocusVisible(document.getElementById(id));
		});
	});

	// On a mark with its categories on the y axis, the vertical arrows move in the series.
	const TURN: Record<string, string> = {
		ArrowDown: 'ArrowRight',
		ArrowUp: 'ArrowLeft',
		ArrowRight: 'ArrowDown',
		ArrowLeft: 'ArrowUp'
	};

	const plotHandlers: ChartContext['plotHandlers'] = {
		onkeydown(event) {
			const id = targetId(event);
			if (!id) return;
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				select(id);
				return;
			}
			const position = positions.get(id)!;
			const horizontal = entries[position.series].horizontal;
			const next = move(
				entries.map((e) => e.points.map((p) => (e.horizontal ? toY(p.y) : toX(p.x)))),
				position,
				horizontal ? (TURN[event.key] ?? event.key) : event.key
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
			const id = targetId(event) ?? nearest(event.clientX, event.clientY);
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
		get fluid() {
			return fluid;
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
		toX,
		toY,
		register(mark) {
			const id = `m${markCount++}`;
			marks.set(id, mark);
			return { id, unregister: () => marks.delete(id) };
		},
		get marks() {
			return [...marks.values()];
		},
		get entries() {
			return entries;
		},
		pointId,
		pointAt,
		locate,
		anchor: (mark, s, index) => marks.get(mark)?.anchor(s, index) ?? null,
		nearest,
		formatX: (value) => xValueFormat(value),
		formatY: (value) => yValueFormat(value),
		get focus() {
			return { id: focusedId, visible: focusVisible };
		},
		isSelected,
		get plotElement() {
			return plotElement;
		},
		set plotElement(value) {
			plotElement = value;
		},
		point(mark, s, index, point) {
			const id = pointId(mark, s, index);
			const current = isSelected(point) ? 'true' : undefined;
			return {
				id,
				role: 'img',
				tabindex: id === tabStopId ? 0 : -1,
				'aria-label': pointLabel(point, marks.get(mark)?.horizontal?.() ?? false),
				'aria-current': current,
				'data-focused': id === focusedId ? 'true' : undefined,
				'data-focus-visible': id === focusedId && focusVisible ? 'true' : undefined,
				'data-selected': current
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
	style:position="relative"
	data-focus-within={focusedId ? 'true' : undefined}
	data-focus-visible={focusVisible ? 'true' : undefined}
	{...restProps}
>
	{@render children?.()}
</figure>
