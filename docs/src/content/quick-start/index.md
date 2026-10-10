---
title: Quick Start
description: Install @human-kit/charts and make your first accessible Svelte chart, with keyboard operation, accessible names and a data table.
---

<script>
	import { Demo, InstallCommand } from '$lib/docs/components/index.js';
	import FirstChart from './demos/first-chart.svelte';
	import firstChartSource from './demos/first-chart.svelte?highlight';
</script>

# Quick Start

`@human-kit/charts` is a set of headless chart components for **Svelte 5**. The parts give you the scales, the geometry, the keyboard operation, the focus control and the accessible names. You write the CSS.

The package is a prototype. It is not on npm yet, and the API can change.

## Installation

<InstallCommand pkg="@human-kit/charts" />

Svelte 5 is a peer dependency. Install it in your project:

<InstallCommand pkg="svelte@^5" />

The package has no runtime dependency. It is native ESM, and each scale has a subpath export. Thus your bundler includes only the parts that you import.

## Your first chart

A chart is a set of parts in the `Chart` namespace:

- `Chart.Root` makes a `<figure>`. It holds the data, the channels and the scales.
- `Chart.Title` makes the `<figcaption>`, and it gives the chart its accessible name.
- `Chart.Plot` makes the `<svg>`. The marks and the guides go in it.
- `Chart.Tooltip` and `Chart.DataTable` go next to the plot, because HTML cannot be in an SVG.

<Demo source={firstChartSource}><FirstChart /></Demo>

Move the focus into the chart with the `Tab` key. The arrow keys move the focus from one point to the next point, and the tooltip shows the values. A screen reader reads the name of each point, for example "March 2025, 14".

## Channels

`x`, `y` and `series` are channels. A channel is the name of a field of the row, or a function of the row:

```svelte
<Chart.Root data={sales} x="month" y={(row) => row.revenue / 1000} series="region">
```

The field names are typed. An incorrect field name is a type error.

## Scales on subpaths

The default scale is linear. For dates or categories, give a scale function from its subpath as the `type` of the scale:

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/charts';
	import { scaleTime } from '@human-kit/charts/scales/time';
	import { scaleBand } from '@human-kit/charts/scales/band';
</script>

<Chart.Root data={visits} x="month" y="visits" xScale={{ type: scaleTime }}>
	<!-- … -->
</Chart.Root>

<Chart.Root data={sales} x="quarter" y="sales" xScale={{ type: scaleBand }}>
	<!-- … -->
</Chart.Root>
```

| Scale         | Subpath                           | Values                |
| ------------- | --------------------------------- | --------------------- |
| `scaleLinear` | `@human-kit/charts/scales/linear` | `number`              |
| `scaleTime`   | `@human-kit/charts/scales/time`   | `Date`                |
| `scaleBand`   | `@human-kit/charts/scales/band`   | `string` (categories) |

The root does not choose the scale from the values. Thus a chart without dates does not include the time scale. In a development build, the root writes a warning when the values and the scale do not agree.

## Styles

The parts are **headless**. They set no color, no font and no size. A mark draws with `currentColor`, thus the CSS `color` of a series is the color of its line, its area or its bars:

```css
.chart [data-series='Docs'] {
	color: #2563eb;
}

.chart [data-point][data-focus-visible] {
	stroke: black;
	stroke-width: 2;
}
```

Each part shows its state in `data-*` attributes. The page of each part lists them in its "Styles" section.

## Next steps

- Read [Chart](/docs/chart) for the data, the scales, the formats and the selection.
- Read [Accessibility](/docs/accessibility) for the keyboard table and the names of the points.
- Look at the marks in the side bar: [Line](/docs/line), [Area](/docs/area) and [Bar](/docs/bar).
