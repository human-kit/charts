import type { Snippet } from 'svelte';
import type { HTMLAttributes, SVGAttributes } from 'svelte/elements';
import type { Channel } from './internal/channel.js';
import type { ChartContext, ChartMargin, ChartPoint, ChartTick } from './root/context.js';
import type { FormatOptions, Scale, ScaleType } from './scales/types.js';

export type {
	Channel,
	ChartContext,
	ChartMargin,
	ChartPoint,
	ChartTick,
	FormatOptions,
	Scale,
	ScaleType
};

/** The settings of the scale of an axis. */
export type ScaleOptions = {
	/**
	 * The type of scale: `scaleLinear` (the default) or `scaleTime`. Import the type from its
	 * subpath, thus a chart without dates does not include the time scale.
	 */
	type?: ScaleType;
	/** The values at the two ends. Without it, the root uses the smallest and the largest value. */
	domain?: [number | Date, number | Date];
	/** Extends the domain to round values. The default is `true` for y and `false` for x. */
	nice?: boolean;
};

/**
 * The format of the values of a channel: the options of `Intl.NumberFormat` or
 * `Intl.DateTimeFormat`, or a function that writes the text.
 */
export type ValueFormat = FormatOptions | ((value: number | Date) => string);

export type ChartRootProps<T> = {
	/** A stable id, from which the component makes its internal ids. Give one on a server. */
	id?: string;
	/** The rows. Each mark uses them when it has no `data` of its own. */
	data?: readonly T[];
	/** The x channel: a field name of the row, or a function of the row. */
	x?: Channel<T, number | Date>;
	/** The y channel: a field name of the row, or a function of the row. */
	y?: Channel<T, number>;
	/** The channel that divides the rows into series. Without it, the chart has one series. */
	series?: Channel<T, string>;
	/** The x scale. */
	xScale?: ScaleOptions;
	/** The y scale. */
	yScale?: ScaleOptions;
	/** The width of the SVG, in pixels. Without it, the chart follows the width of its container. */
	width?: number;
	/** The height of the SVG, in pixels. The default is 300. */
	height?: number;
	/** The space around the plot, in pixels. */
	margin?: Partial<ChartMargin>;
	/**
	 * The point that has the focus, or `null`. You can bind it with `bind:focused`. The component
	 * writes it; it does not read it.
	 */
	focused?: ChartPoint<T> | null;
	/** The component calls it when the user selects a point with `Enter`, `Space` or a click. */
	onSelect?: (point: ChartPoint<T>) => void;
	/** The locale of the values in the names and the ticks. The default is the locale of the page. */
	locale?: string;
	/**
	 * The format of the x values in the accessible names and the ticks. Without it, a time scale
	 * shows dates as precise as the data.
	 */
	xFormat?: ValueFormat;
	/** The format of the y values in the accessible names and the ticks. */
	yFormat?: ValueFormat;
	/** The accessible name of the chart, for when there is no `Chart.Title`. */
	'aria-label'?: string;
	/** The id of the element that gives the chart its name. */
	'aria-labelledby'?: string;
	/** The id of the element that describes the chart, for example a summary of the trend. */
	'aria-describedby'?: string;
	/** The content: the title, the plot and the other parts. */
	children?: Snippet;
	/** The CSS class names of the root element. */
	class?: string;
	/** A bindable reference to the root element. */
	element?: HTMLElement | null;
	/** A bindable reference to the context, for a composition of your own. */
	context?: ChartContext;
} & Omit<
	HTMLAttributes<HTMLElement>,
	'class' | 'children' | 'id' | 'aria-label' | 'aria-labelledby' | 'aria-describedby'
>;

export type ChartTitleProps = Omit<HTMLAttributes<HTMLElement>, 'class'> & {
	/** The CSS class names of the title. */
	class?: string;
};

export type ChartPlotProps = Omit<SVGAttributes<SVGSVGElement>, 'class' | 'role'> & {
	/** The marks and the guides. */
	children?: Snippet;
	/** The CSS class names of the SVG element. */
	class?: string;
	/** A bindable reference to the SVG element. */
	element?: SVGSVGElement | null;
};

export type ChartLineProps<T> = {
	/** The rows of this mark. Without it, the mark uses the data of the root. */
	data?: readonly T[];
	/** The x channel of this mark. Without it, the mark uses the channel of the root. */
	x?: Channel<T, number | Date>;
	/** The y channel of this mark. Without it, the mark uses the channel of the root. */
	y?: Channel<T, number>;
	/** The series channel of this mark. Without it, the mark uses the channel of the root. */
	series?: Channel<T, string>;
	/** The radius of the point of each row, in pixels. The default is 3. */
	r?: number;
	/** The CSS class names of the group of the mark. */
	class?: string;
};

export type ChartAxisProps = {
	/** The side of the plot. The default is `bottom`. `top` and `bottom` show the x scale. */
	position?: 'top' | 'right' | 'bottom' | 'left';
	/** The text of the axis, for example the name and the unit of the values. */
	label?: string;
	/** The length of a tick line, in pixels. The default is 6. */
	tickSize?: number;
	/** The distance between a tick line and its label, in pixels. The default is 3. */
	tickPadding?: number;
	/** The CSS class names of the group of the axis. */
	class?: string;
};

export type ChartGridProps = {
	/** The axis whose ticks give the lines. The default is `y`: horizontal lines. */
	axis?: 'x' | 'y';
	/** The CSS class names of the group of the grid. */
	class?: string;
};
