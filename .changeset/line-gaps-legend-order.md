---
'@human-kit/charts': minor
---

A row without a valid x or y value now breaks a line or an area. Before, the line connected the points on the two sides of the row. `null` and `undefined` are no longer read as zero, and the field types accept them.

`ArrowUp` and `ArrowDown` now move through the series in the order of the legend. Two marks with a series of the same name, for example an area and a line, show that series one after the other.
