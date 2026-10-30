# @human-kit/charts

## 0.6.0

### Minor Changes

- [#45](https://github.com/human-kit/charts/pull/45) [`c6be59a`](https://github.com/human-kit/charts/commit/c6be59aaa6d8c4f37930ed9014cea07193575ebb) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add the `key` channel to `Chart.Root` and to each mark with its own `data`. The key identifies a row in its series when the data changes. With a key, the focus, the tab stop and the selection stay on the same row when you add, remove or sort rows. When the focused row is not in the new data, the focus goes to the point at the same place. Without `key`, the key is the row index, as before. Two rows of a series with the same key make that series use the row index, and a development build writes a warning. `ChartPoint` has the new `key` field, and the selection compares the key and the series.

### Patch Changes

- [#42](https://github.com/human-kit/charts/pull/42) [`c5efcb3`](https://github.com/human-kit/charts/commit/c5efcb3914a74d737304762342b78faf97cfe495) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - A point loses its focused state when the focus moves to another element in the plot. Then the tooltip of that point closes.

## 0.5.0

### Minor Changes

- [#36](https://github.com/human-kit/charts/pull/36) [`88de209`](https://github.com/human-kit/charts/commit/88de2096eaa48182ceab26fb2dc21863fad5a3af) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add `Chart.Arc`, a mark for pie and donut charts. It draws one slice of a circle per row, clockwise from the top. The name of each slice gives its share of the total, the data table adds a share column, and the legend lists the categories in the order of the slices. `inner` makes a donut, and `labels` shows the value in each slice when it fits.

## 0.4.3

### Patch Changes

- [#32](https://github.com/human-kit/charts/pull/32) [`603eecb`](https://github.com/human-kit/charts/commit/603eecbe1f8cda23fff7f3600c0800e2e259631d) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - A `Chart.Tooltip` that follows the pointer moves only along it, at the height of the point. The tooltip is centred with `translate` instead of `transform`, thus a CSS animation of `transform` no longer moves it to the side while it opens or closes.

## 0.4.2

### Patch Changes

- [#30](https://github.com/human-kit/charts/pull/30) [`dbce3d1`](https://github.com/human-kit/charts/commit/dbce3d1f48d86abf1c80d534d51cc6e0313f305f) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - A `Chart.Tooltip` that follows the pointer stays in the nearest ancestor that clips it, not in the page: a page frame with `overflow: hidden` no longer cuts it.

## 0.4.1

### Patch Changes

- [#28](https://github.com/human-kit/charts/pull/28) [`0ab172f`](https://github.com/human-kit/charts/commit/0ab172f93cdb0228256b872d33f54757b4d673da) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - A `Chart.Tooltip` that follows the pointer stays in the width of the page, not of the figure: on a figure narrower than the tooltip, it no longer stops at the edges.

## 0.4.0

### Minor Changes

- [#26](https://github.com/human-kit/charts/pull/26) [`ab8fdf4`](https://github.com/human-kit/charts/commit/ab8fdf45d3e47190ec9f08813b82a66ab851871b) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - `Chart.Tooltip` can follow the pointer (`follow`), and it has `data-entering` and `data-exiting` for CSS animations: it closes after the animation of the closing.

## 0.3.0

### Minor Changes

- [#24](https://github.com/human-kit/charts/pull/24) [`c336b94`](https://github.com/human-kit/charts/commit/c336b9486d47258ee5266dd1cdf73673e58b2f0d) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add `labels` and `radius` to `Chart.Bar`. `labels` writes the value of each bar after its end, and the chart makes space for the labels. `radius` rounds the corners at the end of each bar, and keeps the corners at zero square.

  A band axis now names each category that has room for one line of text. Before, a vertical band axis named only one category in each 32 pixels, thus a short horizontal bar chart showed only every second name.

### Patch Changes

- [#23](https://github.com/human-kit/charts/pull/23) [`7fb0a20`](https://github.com/human-kit/charts/commit/7fb0a20699ddc9b79caba4c3912f9e41edbdc7ec) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - A key press no longer makes the names of all of the points again. Only the two points of a focus move update. With 5,000 dots, a key press takes about 15 milliseconds, from about 80.

## 0.2.0

### Minor Changes

- [#19](https://github.com/human-kit/charts/pull/19) [`a7dbe62`](https://github.com/human-kit/charts/commit/a7dbe6216c0e80bc05256e593cc93bf1b7229be7) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add `Chart.Dot`, a mark that makes one dot per row, for scatter plots. Each series gets its own shape, also in the legend, thus color does not identify a series alone. The dots of a series are in the order of x, then of y, for the keyboard, the DOM and the data table.

  Add `xLabel` and `yLabel` to `Chart.Root`. The names of the points, the axes without a `label`, the tooltip and the data table show them. A dot mark makes a data table with one row per dot.

  When two points of the next series have the same distance in x, `ArrowUp` and `ArrowDown` go to the point with the closest y value.

## 0.1.1

### Patch Changes

- [#15](https://github.com/human-kit/charts/pull/15) [`1e15dff`](https://github.com/human-kit/charts/commit/1e15dff2c4fc98726f91b5ae301f23ee99b9eb3b) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - The tooltip of a bar opens when the pointer is on any part of the bar. Before, it opened only within 40 pixels of the end of the bar, thus a tall bar showed no tooltip on most of its area.

## 0.1.0

### Minor Changes

- [#2](https://github.com/human-kit/charts/pull/2) [`dec8535`](https://github.com/human-kit/charts/commit/dec8535842fed6f76ec9e917b59299b130253a40) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - The first release. It has the parts `Chart.Root`, `Chart.Title`, `Chart.Plot`, `Chart.Line`, `Chart.Area`, `Chart.Bar`, `Chart.Axis`, `Chart.Grid`, `Chart.Legend`, `Chart.Tooltip` and `Chart.DataTable`, and the linear, time and band scales.

- [#5](https://github.com/human-kit/charts/pull/5) [`7e5b9bc`](https://github.com/human-kit/charts/commit/7e5b9bce9bf9a93d11f557d87c15be98cbbed286) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - A row without a valid x or y value now breaks a line or an area. Before, the line connected the points on the two sides of the row. `null` and `undefined` are no longer read as zero, and the field types accept them.

  `ArrowUp` and `ArrowDown` now move through the series in the order of the legend. Two marks with a series of the same name, for example an area and a line, show that series one after the other.

- [#9](https://github.com/human-kit/charts/pull/9) [`327f23b`](https://github.com/human-kit/charts/commit/327f23bbbeebd6fdb6dfca79cd99609fc0e2bd26) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - `Chart.Line`, `Chart.Area` and `Chart.Bar` get a `name` prop. It names the series of a mark without a series channel. The legend, the names of the points and the data table show it. Give each mark a `name` when two marks show two fields of the same rows: a point is then "2015, Cost, 40" and not "2015, 40", and the data table shows the two fields.

- [#11](https://github.com/human-kit/charts/pull/11) [`b39a38e`](https://github.com/human-kit/charts/commit/b39a38efc94a0e6aca50fe16cf2d57dc7cdcf166) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - A stack now shows its series in the order of the legend and of the keyboard. On a vertical stack of bars or areas, the first series is on the top. Before, it was at the bottom, and `ArrowDown` went up on the screen. A horizontal stack does not change: the first series is next to zero, and `ArrowRight` goes to the right.

- [#8](https://github.com/human-kit/charts/pull/8) [`82b5844`](https://github.com/human-kit/charts/commit/82b5844e98fb5e31afd9efbec96d6f3fa81f3dac) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - A mark can have its own `x`, `y` and `series` only when it has its own `data`. Before, the types did not check a channel on a mark without `data`, thus a wrong field name was not an error. Now a channel on a mark without `data` is a type error. To show a second field of the root rows, give the rows to the mark again: `<Chart.Line data={sales} y="cost" />`.

### Patch Changes

- [#4](https://github.com/human-kit/charts/pull/4) [`41ee900`](https://github.com/human-kit/charts/commit/41ee900702f8cc36cb5bd90d6985a44ff8c042f3) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - An axis next to a band scale on y now measures its labels correctly. Before, a chart with horizontal bars and no `margin` did not stop updating after the mount.

- [#7](https://github.com/human-kit/charts/pull/7) [`3806451`](https://github.com/human-kit/charts/commit/3806451b9c666ce58b3a22e4e4b1a709e4435e79) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - The plot now has `role="application"`. A screen reader in browse mode kept the arrow keys for its own reading, thus the keyboard of the chart did not operate. With NVDA, the arrow keys now move the focus through the points, and NVDA reads each point.

- [#10](https://github.com/human-kit/charts/pull/10) [`d35d374`](https://github.com/human-kit/charts/commit/d35d37417d20c96bcb8d201c320dd0d9c84dd03d) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Without a `width` prop, the SVG of `Chart.Plot` has `width="100%"` until the first measure. Before, the server made an SVG of 640 pixels, and on a narrow screen the page was wider than the screen until the hydration. Now the browser scales the chart to its container, and the height does not change.

- [#6](https://github.com/human-kit/charts/pull/6) [`35a2cd2`](https://github.com/human-kit/charts/commit/35a2cd2a73b3475e254ddd492d3293033a165b10) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - The charts work better on a touch screen and on a narrow screen:

  - A tap opens the tooltip on the nearest point, and it stays when the finger lifts. A tap out of the plot, or a finger that scrolls the page, closes it.
  - A click or a tap less than 40 pixels from a point selects it.
  - The tooltip stays in the width of the figure.
  - An axis measures its labels again when a web font loads. Before, the labels could be cut.
  - A band axis shows each category while each one has 32 pixels. Before, it used the spacing of a number axis and skipped categories.
