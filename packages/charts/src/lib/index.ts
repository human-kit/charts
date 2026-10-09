export * as Chart from './index.parts.js';

export { default as ChartRoot } from './root/chart-root.svelte';
export { default as ChartTitle } from './title/chart-title.svelte';
export { default as ChartPlot } from './plot/chart-plot.svelte';
export { default as ChartLine } from './line/chart-line.svelte';

export type {
	Channel,
	ChartContext,
	ChartMargin,
	ChartPoint,
	ChartRootProps,
	ChartTitleProps,
	ChartPlotProps,
	ChartLineProps,
	LinearScaleOptions
} from './types.js';
export { getChartContext, useChartContext } from './root/context.js';
