# RFC 0001: Architecture of `@human-kit/charts`

- **Status:** Draft
- **Date:** 2026-10-09
- **Scope:** version 1

## Summary

`@human-kit/charts` is a set of headless chart components for Svelte 5. A chart
is a composition of parts in one namespace. The root holds the data and the
scales. Each mark draws one layer of the chart from the data. The library gives
the behavior: the scales, the geometry, the keyboard operation, the focus
control and the accessible names. You write all of the CSS.

The library has two primary requirements, in this order:

1. Accessibility. A keyboard user and a screen reader user get the same data as
   a pointer user.
2. Size. The library has no runtime dependency, and each part has a subpath
   export. The goal is the smallest size possible.

## Goals

- A chart is a composition of marks, not a chart type with options. Two marks
  can share the scales, and each mark can have its own data.
- The field names of the data are typed. An incorrect field name is a type
  error.
- Each chart has one tab stop. The arrow keys move the focus over the data.
- Each chart can show its data as a table.
- The chart follows the size of its container.
- The library is correct on a server. It makes a static SVG without a browser.
- The public API follows the conventions of `@human-kit/ui`: namespaces, parts,
  `bind:` on each stateful prop, `controlled*` props, and `data-*` attributes.

## Non-goals for version 1

- A Canvas renderer.
- Animation. A transition is a later addition, and it will obey
  `prefers-reduced-motion`.
- Brush, zoom and pan.
- Data fetch, data cleanup and aggregation. The application prepares the data.
  The library includes only the stack transform that the bar and area marks
  need.
- Pie, donut, scatter and other chart forms. They come after version 1.

## Scope of version 1

| Group  | Parts                                                       |
| ------ | ----------------------------------------------------------- |
| Root   | `Chart.Root`, `Chart.Title`, `Chart.Plot`                   |
| Marks  | `Chart.Line`, `Chart.Area`, `Chart.Bar`                     |
| Guides | `Chart.Axis`, `Chart.Grid`, `Chart.Legend`                  |
| Access | `Chart.Tooltip`, `Chart.DataTable`                          |
| Scales | `linear`, `band`, `time` (pure functions, one subpath each) |

## Principles

### Headless

- A part makes plain SVG or HTML elements. It sets no color, no font and no
  size.
- A part shows its state in `data-*` attributes, for example `data-series`,
  `data-focused` and `data-focus-visible`.
- A mark draws with `currentColor` and CSS custom properties. Thus a chart
  without CSS is visible, and a theme is a stylesheet.
- An optional stylesheet, `@human-kit/charts/theme.css`, gives a default
  theme. The components do not import it.

### Size

- No runtime dependency. The scales, the tick algorithm, the path generators
  and the stack transform are in this package.
- One subpath export per part and per scale. A bundler includes only the parts
  that you import.
- `"sideEffects": false` in `package.json`.
- `pnpm size` measures the gzip size of a set of fixed charts. CI runs it on
  each pull request and writes the result in the pull request. An increase
  needs a reason in the pull request body.
- An implementation decision that adds bytes must give an accessibility or
  correctness reason. A shorter API is not a reason.

### Typed data

- `Chart.Root` is generic over the row type `T`.
- A channel is a field name of `T` or a function of the row:
  `y="revenue"` or `y={(row) => row.revenue / 1000}`.
- `onSelect` and the focus state give the original row, with the type `T`.

## Anatomy

`Chart.Root` makes a `<figure>`. `Chart.Plot` makes the `<svg>` in it. The
marks and the guides go in `Chart.Plot`. The HTML parts (title, legend,
tooltip, data table) go next to it, because HTML cannot be in an SVG.

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/charts';

	type Sale = { month: Date; revenue: number; region: string };
	let { sales }: { sales: Sale[] } = $props();
</script>

<Chart.Root data={sales} x="month" y="revenue" series="region">
	<Chart.Title>Revenue per month</Chart.Title>
	<Chart.Plot>
		<Chart.Grid axis="y" />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" label="Revenue (USD)" />
		<Chart.Line />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
```

## API

### `Chart.Root`

| Prop                            | Description                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| `data: T[]`                     | The rows. Each mark uses them when it has no `data` of its own.                            |
| `x`, `y`                        | The channels of the two axes: a field name of `T`, or a function of the row.               |
| `series`                        | The channel that divides the rows into series. Without it, the chart has one series.       |
| `xScale`, `yScale`              | The scale of each axis. Without it, the root infers the scale from the values (see below). |
| `width`, `height`               | The size in pixels. Without `width`, the chart follows the width of its container.         |
| `margin`                        | The space around the plot. Without it, the root measures the axis labels.                  |
| `focused`                       | The point that has the focus, or `null`. You can bind it with `bind:focused`.              |
| `onSelect(point)`               | The root calls it when the user selects a point with `Enter`, `Space` or a click.          |
| `locale`, `formatOptions`       | The format of the values in names, the tooltip and the data table.                         |
| `aria-label`, `aria-labelledby` | The accessible name of the chart. One of the two, or a `Chart.Title`, is necessary.        |
| `aria-describedby`              | The id of an element that describes the chart, for example a summary of the trend.         |
| `class`, `element`, `context`   | The same as in `@human-kit/ui`.                                                            |

A mark can replace the `data`, `x`, `y` and `series` of the root with its own
props. Thus one chart can show a line of sales and a rule at each campaign date.

### Scale inference

| Values of the channel | Scale    |
| --------------------- | -------- |
| `number`              | `linear` |
| `Date`                | `time`   |
| `string`              | `band`   |

A `xScale` or `yScale` prop replaces the inferred scale, for example
`yScale={{ type: 'linear', domain: [0, 100], nice: true }}`.

Each scale is also a pure function on its own subpath, for example
`@human-kit/charts/scales/linear`. The time scale makes its tick labels with
`Intl.DateTimeFormat`. It does not include a calendar library.

### Marks

| Part         | Description                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| `Chart.Line` | Makes one `<path>` per series, and one focus target per point.                                           |
| `Chart.Area` | Makes one filled `<path>` per series. `stack` puts the series one on the other.                          |
| `Chart.Bar`  | Makes one `<rect>` per row. `layout` is `grouped` or `stacked`. `orientation` is vertical or horizontal. |

A row without a finite value is a gap in the line. It is not a focus target,
but the data table shows it.

### Guides

| Part           | Description                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------- |
| `Chart.Axis`   | Makes the ticks and the labels of one axis. `position` is `top`, `right`, `bottom` or `left`. |
| `Chart.Grid`   | Makes the grid lines of one axis.                                                             |
| `Chart.Legend` | Makes a list of the series. In version 1, a legend item does not hide a series.               |

The axes, the grid lines and the legend are not in the accessibility tree. The
same information is in the names of the points and in the data table.

## Accessibility

### Structure

- `Chart.Root` makes a `<figure>`. `Chart.Title`, when it is present, is the
  `<figcaption>`.
- The SVG of `Chart.Plot` has the accessible name of the chart and
  `aria-roledescription="chart"`.
- Each series is a group with the name of the series.
- Each point is an element with an accessible name that has all of its values,
  for example "March, North, revenue 58".
- The decoration (paths, axes, grid lines) has `aria-hidden="true"`.

The exact roles are an open question (see below). The prototype must test them
with NVDA, JAWS and VoiceOver before this RFC changes to "Accepted".

### Keyboard

The plot is one tab stop. The focus moves with a roving `tabindex` over the
points, as in a grid of the WAI-ARIA APG.

| Key                       | Action                                                         |
| ------------------------- | -------------------------------------------------------------- |
| `Tab`                     | Moves the focus into the plot, to the last focused point.      |
| `ArrowRight`, `ArrowLeft` | Moves to the next or the previous point in the series.         |
| `ArrowUp`, `ArrowDown`    | Moves to the point with the closest x value in another series. |
| `Home`, `End`             | Moves to the first or the last point in the series.            |
| `PageUp`, `PageDown`      | Moves ten points in the series.                                |
| `Enter`, `Space`          | Selects the point and calls `onSelect`.                        |
| `Escape`                  | Closes the tooltip. The focus stays on the point.              |

The keys do not wrap: at the last point of a series, `ArrowRight` does nothing.

The horizontal arrows follow the direction of the x axis on the screen, not the
text direction. A chart does not reverse its x axis in a right-to-left page.

For `Chart.Bar` with a horizontal orientation, the vertical arrows move in the
series and the horizontal arrows move between the series.

### Focus

- The parts obey the focus contract of `@human-kit/ui`: `data-focused`,
  `data-focus-visible` and `data-focus-within`, with the same rules of
  modality.
- The focused point shows `data-focused`. The root shows `data-focus-within`.
- A pointer press on a point moves the focus to it without a focus ring. A key
  press after it shows the ring.
- The focus stays on the same row after a data update, when that row is still
  in the data. Rows are found by a `key` channel. Without it, the row index is
  the key.

### Tooltip

- `Chart.Tooltip` opens on the focused point and on the point under the
  pointer.
- It opens on a focus only when the focus came from the keyboard, as the
  tooltip of `@human-kit/ui` does.
- The screen reader reads the accessible name of the point. The tooltip does
  not repeat it, thus the tooltip has `aria-hidden="true"`.
- The tooltip never contains a control, and it never takes the focus.
- A value is never available only in the tooltip.

### Data table

- `Chart.DataTable` makes a `<table>` with all of the values of the chart, a
  `<caption>`, and `scope` on the header cells.
- `visibility` is `visible` or `screen-reader`. With `screen-reader`, the table
  is in the accessibility tree but not on the screen.
- A row of the table and a point of the chart share the selection.

### Other requirements

- The chart is correct in `forced-colors` mode. The marks use system colors
  there.
- A series is never identified by color alone. The legend and the names of the
  points give the name of the series.
- The library makes no live region in version 1. A focus move makes the screen
  reader read the name of the point, and a data update must not interrupt the
  user.

## Size and rendering on a server

- The root makes the SVG on the server with the `width` prop, or with a default
  width of 640 pixels. After the mount, it measures the container with a
  `ResizeObserver`.
- The margins come from the measured size of the tick labels after the mount.
  On the server, the root uses default margins.
- The chart does not move after the mount when the consumer gives `width` and
  `margin`.
- A mark adds its data to the scales when it starts. On the server, a mark
  that comes later in the markup cannot change the scales of the marks before
  it. A mark with its own `data` must thus be after the other marks, or the
  consumer must give the domain.

## Repository layout

The repository follows the layout of `@human-kit/ui`:

- `packages/charts/`: the publishable package, `@human-kit/charts`.
- `docs/`: the documentation site and the live demos (after the prototype).
- `rfcs/`: the design documents.
- `.changeset/`: versions and release notes.
- `scripts/`: the size check, the ASD-STE100 check and the TODO check.

Tools: pnpm, Svelte 5 with runes, TypeScript, Vitest in browser mode, and
changesets. The docs site is on Vercel and uses `@human-kit/markdown`.

## Tests

- Unit tests for each scale, the tick algorithm, the path generators and the
  stack transform.
- Browser tests for the keyboard table, the focus contract and the selection.
- Server tests: each part makes the same markup on the server as on the client.
- An accessibility tree test for each mark: names, roles and hidden elements.
- A manual test with NVDA, JAWS and VoiceOver before each minor version.

## Prototype plan

The prototype answers the open questions before the full implementation:

1. `Chart.Root`, the linear scale, `Chart.Line` and the keyboard table.
2. Measure the gzip size of that chart.
3. Test the roles of the structure with NVDA, JAWS and VoiceOver.
4. Test the generic types from `Chart.Root` to the marks.

## Prototype results

Steps 1 and 2 are complete (2026-10-09).

- `Chart.Root`, `Chart.Title`, `Chart.Plot`, `Chart.Line` and the linear scale
  are in `packages/charts`. 18 tests pass in a browser, and 1 test passes on the server.
- Size of a line chart with the keyboard operation: 3.78 kB gzip, 8.99 kB
  minified, without the Svelte runtime.
- Two problems that the prototype found:
  1. The names use one number format for all of the values. A year shows as
     "2,014". Each channel needs its own format, and the time scale must format
     dates.
  2. `ArrowDown` moves to the next series in the order of the data, not to the
     series below on the screen. When the lines cross, the order on the screen
     changes from one x value to the next.

## Open questions

1. **The roles of the points.** The candidates are `role="img"` on each point
   (the prototype uses it), the `graphics-symbol` role of the WAI-ARIA graphics
   module, and a `grid` with `row` and `gridcell`. The support for each role in
   screen readers is different, and the prototype must measure it.
2. **The type of the marks.** A child component cannot get the generic type of
   its parent in Svelte 5. Thus a mark without its own `data` cannot check the
   field names of the root. The candidates are a typed factory, for example
   `const Chart = createChart<Sale>()`, and the root-level channels only.
3. **The order of the series for `ArrowUp` and `ArrowDown`.** The candidates
   are the order of the legend, which does not change, and the order on the
   screen at the focused x value, which follows the lines. A user who
   cannot see the chart knows only the order of the legend.
4. **The keyboard model for a bar chart** with many series: the prototype must
   confirm that the up and down arrows are clear to the user.
5. **The default width on the server**, and how the chart shows the change
   after the first measure.
6. **The name of a value.** The prototype names a point "2015, South, 66".
   A name with the field, for example "2015, South, revenue 66", is longer but
   clear when a chart has two y channels.
