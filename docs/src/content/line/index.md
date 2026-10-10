---
title: Line
description: Chart.Line draws one line per series with a focusable point per row — a keyboard-accessible Svelte line chart with typed channels and data of its own.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import OwnData from './demos/own-data.svelte';
	import ownDataSource from './demos/own-data.svelte?highlight';
	import api from './api.json';
</script>

# Line

`Chart.Line` draws one line for each series. Each row is a point on the line. The point is a focus target with an accessible name.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/charts';
	import { scaleTime } from '@human-kit/charts/scales/time';
</script>

<Chart.Root data={rows} x="year" y="downloads" series="package" xScale={{ type: scaleTime }}>
	<Chart.Title>Downloads per year</Chart.Title>
	<Chart.Plot>
		<Chart.Line />
	</Chart.Plot>
</Chart.Root>
```

The mark makes a `<g>` with one group for each series. A series group holds a `<path>` for the line and one `<circle>` for each point.

## Points

Each point is a circle with the radius `r`. The default is 3 pixels. Give `r={0}` to hide the points. They stay focus targets, and you can show the focused point with `data-focused`.

The order of the points is the order of the rows. Sort the rows by x before you give them to the chart.

A row without a valid x or y value has no point, and the line stops there. The line starts again at the next row with a value. A value is valid when it is a string, a finite number or a valid date. Thus `null`, `undefined` and `NaN` are not valid. They are not zero. A row without a value is not a focus target, and it is not in the data table. The same rule applies to areas.

## A mark with its own data

A mark can replace the `data`, `x`, `y` and `series` of the root with its own props. Thus one chart can show two sets of rows with different fields, on the same scales. The values of the mark go into the domains of the scales.

<Demo source={ownDataSource}><OwnData /></Demo>

The field names of a mark without its own `data` are not checked against the type of the root data.

## Keyboard

The arrow keys move the focus along the line. `ArrowUp` and `ArrowDown` move to the point with the closest x value in the previous or the next series. The full table is on the [Accessibility](/docs/accessibility) page.

## Styles

Give each series a color with the CSS `color`. The path uses it as its stroke, and the points use it as their fill. Give the line a `stroke-width`.

```css
.chart [data-series='Core'] {
	color: #2563eb;
}

.chart [data-line] {
	stroke-width: 2;
}

.chart [data-point][data-focused] {
	r: 5;
}
```

| Element           | Attribute            | When                                                           |
| ----------------- | -------------------- | -------------------------------------------------------------- |
| Group of the mark | `data-mark`          | Always. The value is `line`.                                   |
| Group of a series | `data-series`        | The series has a name. The value is the name.                  |
| Path              | `data-line`          | Always.                                                        |
| Point             | `data-point`         | Always.                                                        |
| Point             | `data-focused`       | The point has the focus.                                       |
| Point             | `data-focus-visible` | The point has the focus, and the focus came from the keyboard. |
| Point             | `data-selected`      | The point is selected.                                         |

## API reference

<ApiReference api={api} />
