import { getContext, setContext } from 'svelte';
import type { Channel } from '../internal/channel.js';
import type { LinearScale } from '../scales/linear.js';

/** One point of the chart, as the focus state and `onSelect` give it. */
export type ChartPoint<T = unknown> = {
	/** The row of the data. */
	datum: T;
	/** The index of the row in the data of its mark. */
	index: number;
	/** The name of the series. It is empty when the chart has one series. */
	series: string;
	/** The value of the x channel. */
	x: number;
	/** The value of the y channel. */
	y: number;
};

/** The points of one series of a mark. */
export type ChartSeries<T = unknown> = {
	name: string;
	points: ChartPoint<T>[];
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
	readonly x: Channel<any, number> | undefined;
	readonly y: Channel<any, number> | undefined;
	readonly series: Channel<any, string> | undefined;
	/** The size of the SVG, in pixels. */
	readonly width: number;
	readonly height: number;
	readonly margin: ChartMargin;
	readonly xScale: LinearScale;
	readonly yScale: LinearScale;
	/** The id of the `Chart.Title` element, when one is in the DOM. */
	titleId: string | null;
	/** Adds a mark. `series` is read again each time the data changes. */
	register(series: () => ChartSeries[]): { id: string; unregister(): void };
	/** The attributes of the element of a point. */
	point(mark: string, series: number, index: number): PointAttributes;
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
