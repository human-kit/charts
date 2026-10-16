---
'@human-kit/charts': minor
---

Add `Chart.Dot`, a mark that makes one dot per row, for scatter plots. Each series gets its own shape, also in the legend, thus color does not identify a series alone. The dots of a series are in the order of x, then of y, for the keyboard, the DOM and the data table.

Add `xLabel` and `yLabel` to `Chart.Root`. The names of the points, the axes without a `label`, the tooltip and the data table show them. A dot mark makes a data table with one row per dot.

When two points of the next series have the same distance in x, `ArrowUp` and `ArrowDown` go to the point with the closest y value.
