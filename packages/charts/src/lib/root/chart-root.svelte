<script lang="ts" generics="T">
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { move } from '../internal/navigation.js';
	import { isFocusVisible, onModalityChange } from '../internal/modality.js';
	import { nice, scaleLinear } from '../scales/linear.js';
	import type { ChartRootProps } from '../types.js';
	import {
		setChartContext,
		type ChartContext,
		type ChartPoint,
		type ChartSeries
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
		formatOptions,
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
	const margin = $derived({ top: 8, right: 8, bottom: 8, left: 8, ...marginProp });

	// The marks, in mount order. The order of the marks is the order of the series for the keyboard.
	const marks = new SvelteMap<string, () => ChartSeries[]>();
	let markCount = 0;

	type Entry = { mark: string; series: number; points: ChartPoint[] };
	const entries = $derived.by(() => {
		const out: Entry[] = [];
		for (const [mark, read] of marks) {
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

	function extent(values: number[]): [number, number] {
		return values.length ? [Math.min(...values), Math.max(...values)] : [0, 1];
	}

	const xDomain = $derived.by(() => {
		const domain =
			xScaleOptions?.domain ?? extent(entries.flatMap((e) => e.points.map((p) => p.x)));
		return xScaleOptions?.nice ? nice(domain) : domain;
	});
	const yDomain = $derived.by(() => {
		const domain =
			yScaleOptions?.domain ?? extent(entries.flatMap((e) => e.points.map((p) => p.y)));
		return (yScaleOptions?.nice ?? true) ? nice(domain) : domain;
	});
	const xScale = $derived(scaleLinear(xDomain, [margin.left, width - margin.right]));
	const yScale = $derived(scaleLinear(yDomain, [height - margin.bottom, margin.top]));

	const numberFormat = $derived(new Intl.NumberFormat(locale, formatOptions));

	/** The accessible name of a point: the x value, the series and the y value. */
	function pointLabel(point: ChartPoint) {
		const parts = [numberFormat.format(point.x)];
		if (point.series) parts.push(point.series);
		parts.push(numberFormat.format(point.y));
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
				entries.map((e) => e.points.map((p) => p.x)),
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
		get titleId() {
			return titleId;
		},
		set titleId(value) {
			titleId = value;
		},
		register(read) {
			const id = `m${markCount++}`;
			marks.set(id, read);
			return { id, unregister: () => marks.delete(id) };
		},
		point(mark, s, index) {
			const id = pointId(mark, s, index);
			const point = pointAt(id);
			return {
				id,
				role: 'img',
				tabindex: id === tabStopId ? 0 : -1,
				'aria-label': point ? pointLabel(point) : '',
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
