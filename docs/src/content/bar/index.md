---
title: Bar
description: Chart.Bar draws grouped, stacked and horizontal bars on a band scale — an accessible Svelte bar chart where every bar is a keyboard focus target.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Horizontal from './demos/horizontal.svelte';
	import horizontalSource from './demos/horizontal.svelte?highlight';
	import api from './api.json';
</script>

# Bar

`Chart.Bar` draws one bar for each row. Each bar is a focus target with an accessible name. The categories are on a band scale, and the values start at zero.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/charts';
	import { scaleBand } from '@human-kit/charts/scales/band';
</script>

<Chart.Root data={rows} x="quarter" y="sales" series="region" xScale={{ type: scaleBand }}>
	<Chart.Title>Sales per quarter</Chart.Title>
	<Chart.Plot>
		<Chart.Bar layout="grouped" />
	</Chart.Plot>
</Chart.Root>
```

The mark makes a `<g>` with one group for each series. A series group holds one `<rect>` for each row.

The axis of the categories needs a band scale. Import `scaleBand` from `@human-kit/charts/scales/band`, and give it as the `type` of the scale. In a development build, the mark writes a warning when the scale has no bands.

## Grouped and stacked

`layout` sets how the bars of two series share a category:

- `grouped` (the default) puts the bars side by side. `groupPadding` is the space between the bars of a group, as a fraction of a bar.
- `stacked` puts the bars one on the other. A negative value goes below zero.

A stack shows the series in the order of the legend and of the keyboard. On vertical bars, the first series is on the top, thus `ArrowDown` goes to the bar below. On horizontal bars, the first series is next to zero, thus `ArrowRight` goes to the bar on the right.

A stack changes the domain of the value scale. On the server, a guide before the mark does not see the top of the stack. Thus put the mark before the guides, or give the `domain` of the value scale.

## Horizontal bars

Put the categories on the y axis to make horizontal bars, and give the y scale the band type. The bars then grow along x, and the x scale includes zero.

<Demo source={horizontalSource}><Horizontal /></Demo>

For horizontal bars, the vertical arrows move the focus from one bar to the next bar in the series. The name of a bar, a row of the data table and the tooltip start with the category.

## Styles

Give each series a color with the CSS `color`. Each bar uses it as its fill.

```css
.chart [data-bar][data-focused] {
	opacity: 0.8;
}

.chart [data-bar][data-focus-visible] {
	stroke: black;
	stroke-width: 2;
}
```

| Element           | Attribute            | When                                                         |
| ----------------- | -------------------- | ------------------------------------------------------------ |
| Group of the mark | `data-mark`          | Always. The value is `bar`.                                  |
| Group of the mark | `data-layout`        | Always. The value is `grouped` or `stacked`.                 |
| Group of the mark | `data-orientation`   | Always. The value is `vertical` or `horizontal`.             |
| Group of a series | `data-series`        | The series has a name. The value is the name.                |
| Bar               | `data-bar`           | Always.                                                      |
| Bar               | `data-point`         | Always.                                                      |
| Bar               | `data-negative`      | The value of the bar is below zero.                          |
| Bar               | `data-focused`       | The bar has the focus.                                       |
| Bar               | `data-focus-visible` | The bar has the focus, and the focus came from the keyboard. |
| Bar               | `data-selected`      | The bar is selected.                                         |

## API reference

<ApiReference api={api} />
