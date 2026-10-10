---
title: Legend
description: Chart.Legend lists the series of a Svelte chart in an HTML list, with a swatch per series or content of your own, so color is never the only key.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Custom from './demos/custom.svelte';
	import customSource from './demos/custom.svelte?highlight';
	import api from './api.json';
</script>

# Legend

`Chart.Legend` makes a list of the series of the chart. Each item has a swatch and the name of the series. The legend tells the user which color is which series.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

```svelte
<Chart.Root data={rows} x="test" y="score" series="device">
	<Chart.Plot>
		<Chart.Bar />
	</Chart.Plot>
	<Chart.Legend />
</Chart.Root>
```

The legend is HTML, thus it goes in `Chart.Root` and not in `Chart.Plot`. It makes a `<ul>` with one `<li>` for each series. The order of the items is the order of the series in the marks. Two marks with one series name make one item.

A chart with one series that has no name has no legend. The legend then makes nothing.

## Content of your own

Give `children` to replace the content of an item. The snippet receives the name and the index of the series.

<Demo source={customSource}><Custom /></Demo>

## Accessibility

The legend has `aria-hidden="true"`. The name of each point and the data table already give the name of the series. Thus a screen reader does not read the legend a second time.

In version 1, a legend item does not hide a series.

## Styles

Each item has the `data-series` attribute of its series, the same as the series group in the SVG. Give the swatch a size and a background:

```css
.legend [data-swatch] {
	display: inline-block;
	width: 0.75rem;
	height: 0.75rem;
	background: currentColor;
}

.legend [data-series='Desktop'] {
	color: #2563eb;
}
```

| Element                  | Attribute          | Value                   |
| ------------------------ | ------------------ | ----------------------- |
| List                     | `data-legend`      | Empty.                  |
| Item                     | `data-legend-item` | Empty.                  |
| Item                     | `data-series`      | The name of the series. |
| Swatch, without children | `data-swatch`      | Empty.                  |

## API reference

<ApiReference api={api} />
