import { getContext, setContext } from 'svelte';
import type { Channel } from '../internal/channel.js';
import type { Scale } from '../scales/types.js';

/** One point of the chart, as the focus state and `onSelect` give it. */
export type ChartPoint<T = unknown> = {
	/** The row of the data. */
	datum: T;
	/** The index of the row in the data of its mark. */
	index: number;
	/** The name of the series. It is empty when the chart has one series. */
	series: string;
	/** The value of the x channel. */
	x: XValue;
	/** The value of the y channel. */
	y: number;
};

/** A value of the x channel: a number, a date, or a category of a band scale. */
export type XValue = number | Date | string;

/** The values that a mark adds to the domains of the scales. */
export type ChartExtent = { x?: XValue[]; y?: number[] };

/** The points of one series of a mark. */
export type ChartSeries<T = unknown> = {
	name: string;
	points: ChartPoint<T>[];
};

/** A tick of an axis. */
export type ChartTick = {
	/** The value, as a number. A date is its time in milliseconds. */
	value: number;
	/** The position on the axis, in pixels. */
	position: number;
	/** The text of the label. */
	label: string;
};

/** The space around the plot, in pixels. */
export type ChartMargin = { top: number; right: number; bottom: number; left: number };

/** The attributes of the element of a point. A mark spreads them on the element. */
export type PointAttributes = {
	id: string;
	role: 'img';
	tabindex: 0 | -1;
	'aria-label': string;
	'data-focused': 'true' | undefined;
	'data-focus-visible': 'true' | undefined;
};

// The channels of the root are typed by `Chart.Root`; the context does not know `T`.
/* eslint-disable @typescript-eslint/no-explicit-any */
export type ChartContext = {
	/** The instance id. Every id of the parts is made from it. */
	readonly instanceId: string;
	readonly data: readonly any[];
	readonly x: Channel<any, XValue> | undefined;
	readonly y: Channel<any, number> | undefined;
	readonly series: Channel<any, string> | undefined;
	/** The size of the SVG, in pixels. */
	readonly width: number;
	readonly height: number;
	readonly margin: ChartMargin;
	readonly xScale: Scale;
	readonly yScale: Scale;
	/** The ticks of each axis. `Chart.Axis` and `Chart.Grid` share them. */
	readonly xTicks: ChartTick[];
	readonly yTicks: ChartTick[];
	/**
	 * Asks for space around the plot, for the labels of an axis. The margin of a side is the
	 * largest space that a part asks for, unless the consumer gives the margin.
	 */
	reserve(needs: Partial<ChartMargin>): {
		update(needs: Partial<ChartMargin>): void;
		unregister(): void;
	};
	/** The id of the `Chart.Title` element, when one is in the DOM. */
	titleId: string | null;
	/** An x value as a number for the x scale: a date is its time, and a category is its index. */
	toX(value: XValue): number;
	/**
	 * Adds a mark. `series` is read again each time the data changes. `extent` gives the values
	 * that the domains must include in addition to the data of the root: the data of a mark with
	 * data or channels of its own, or the tops of a stack.
	 */
	register(
		series: () => ChartSeries[],
		extent?: () => ChartExtent
	): { id: string; unregister(): void };
	/** The attributes of the element of a point. */
	point(mark: string, series: number, index: number, point: ChartPoint): PointAttributes;
	/** The accessible name and description of the chart, for the `Chart.Plot` element. */
	readonly labels: {
		'aria-label': string | undefined;
		'aria-labelledby': string | undefined;
		'aria-describedby': string | undefined;
	};
	/** The handlers of the `Chart.Plot` element. */
	readonly plotHandlers: {
		onkeydown(event: KeyboardEvent): void;
		onfocusin(event: FocusEvent): void;
		onfocusout(event: FocusEvent): void;
		onclick(event: MouseEvent): void;
	};
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const KEY = Symbol('human-kit-chart');

export function setChartContext(context: ChartContext) {
	setContext(KEY, context);
}

/** The context of the closest `Chart.Root`, or `undefined` outside one. */
export function getChartContext(): ChartContext | undefined {
	return getContext<ChartContext | undefined>(KEY);
}

/** The context of the closest `Chart.Root`. It throws outside one. */
export function useChartContext(part: string): ChartContext {
	const context = getChartContext();
	if (!context) throw new Error(`${part} must be inside Chart.Root.`);
	return context;
}
