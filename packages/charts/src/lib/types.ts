import type { Snippet } from 'svelte';
import type { HTMLAttributes, SVGAttributes } from 'svelte/elements';
import type { Channel } from './internal/channel.js';
import type {
	ChartContext,
	ChartMargin,
	ChartPoint,
	ChartTick,
	ChartTooltipState,
	ChartValue
} from './root/context.js';
import type { FormatOptions, Scale, ScaleType } from './scales/types.js';

export type {
	Channel,
	ChartContext,
	ChartMargin,
	ChartPoint,
	ChartTick,
	FormatOptions,
	Scale,
	ScaleType,
	ChartTooltipState,
	ChartValue
};

/** The settings of the scale of an axis. */
export type ScaleOptions = {
	/**
	 * The type of scale: `scaleLinear` (the default), `scaleTime` or `scaleBand`. Import the type
	 * from its subpath, thus a chart includes only the scales that it uses.
	 */
	type?: ScaleType;
	/** The values at the two ends. Without it, the root uses the smallest and the largest value. */
	domain?: [number | Date, number | Date];
	/** Extends the domain to round values. The default is the same as for `zero`. */
	nice?: boolean;
	/**
	 * Extends the domain to include zero. A bar starts at zero, thus a bar chart needs it. The
	 * default is `true` for the value axis of a chart with categories on the other axis, and for y
	 * when no axis has categories.
	 */
	zero?: boolean;
	/** The space between two bands of a band scale, as a fraction of a step. The default is 0.2. */
	padding?: number;
};

/**
 * The format of the values of a channel: the options of `Intl.NumberFormat` or
 * `Intl.DateTimeFormat`, or a function that writes the text.
 */
export type ValueFormat = FormatOptions | ((value: ChartValue) => string);

export type ChartRootProps<T> = {
	/** A stable id, from which the component makes its internal ids. Give one on a server. */
	id?: string;
	/** The rows. Each mark uses them when it has no `data` of its own. */
	data?: readonly T[];
	/** The x channel: a field name of the row, or a function of the row. */
	x?: Channel<T, ChartValue>;
	/** The y channel: a field name of the row, or a function of the row. */
	y?: Channel<T, ChartValue>;
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
	/**
	 * The selected point, or `null`. You can bind it with `bind:selected`. `Enter`, `Space` or a
	 * click selects a point, and a second time clears the selection. The selected point has
	 * `aria-current="true"` and `data-selected`, and so has its cell in `Chart.DataTable`. The
	 * selection follows the row index and the series of the point.
	 */
	selected?: ChartPoint<T> | null;
	/** The component calls it when the user activates a point with `Enter`, `Space` or a click. */
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
	x?: Channel<T, ChartValue>;
	/** The y channel of this mark. Without it, the mark uses the channel of the root. */
	y?: Channel<T, ChartValue>;
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

export type ChartBarProps<T> = Omit<ChartLineProps<T>, 'r'> & {
	/**
	 * How the bars of two series share a category. `grouped` puts them side by side, and
	 * `stacked` puts them one on the other. The default is `grouped`.
	 */
	layout?: 'grouped' | 'stacked';
	/** The space between the bars of a group, as a fraction of a bar. The default is 0.1. */
	groupPadding?: number;
};

export type ChartAreaProps<T> = Omit<ChartLineProps<T>, 'r'> & {
	/** Puts the series one on the other. The default is `false`: each area starts at zero. */
	stacked?: boolean;
	/** The radius of the point of each row, in pixels. The default is 0: the points are hidden. */
	r?: number;
	/** The radius of the point that has the focus, in pixels. The default is 4. */
	focusRadius?: number;
};

export type ChartLegendProps = Omit<HTMLAttributes<HTMLUListElement>, 'class' | 'children'> & {
	/**
	 * The content of an item. It receives the name and the index of the series. Without it, an
	 * item shows an empty `data-swatch` element and the name.
	 */
	children?: Snippet<[{ name: string; index: number }]>;
	/** The CSS class names of the list. */
	class?: string;
};

export type ChartDataTableProps = Omit<HTMLAttributes<HTMLTableElement>, 'class' | 'children'> & {
	/**
	 * `visible` shows the table. `screen-reader` keeps it only in the accessibility tree. The
	 * default is `screen-reader`.
	 */
	visibility?: 'visible' | 'screen-reader';
	/** The caption of the table. Without it, the `Chart.Title` names the table. */
	caption?: string;
	/**
	 * The header of the first column: the column of the categories, or of the x values. The default
	 * is the name of the field.
	 */
	rowHeader?: string;
	/** The CSS class names of the table. */
	class?: string;
};

export type ChartTooltipProps = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
	/**
	 * The content. It receives the point, and the x and y values as text. Without it, the tooltip
	 * shows the x value, the series and the y value.
	 */
	children?: Snippet<[ChartTooltipState]>;
	/** The distance between the point and the tooltip, in pixels. The default is 8. */
	offset?: number;
	/** The CSS class names of the tooltip. */
	class?: string;
};
