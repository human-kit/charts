---
'@human-kit/charts': minor
---

Add the `key` channel to `Chart.Root` and to each mark with its own `data`. The key identifies a row in its series when the data changes. With a key, the focus, the tab stop and the selection stay on the same row when you add, remove or sort rows. When the focused row is not in the new data, the focus goes to the point at the same place. Without `key`, the key is the row index, as before. Two rows of a series with the same key make that series use the row index, and a development build writes a warning. `ChartPoint` has the new `key` field, and the selection compares the key and the series.
