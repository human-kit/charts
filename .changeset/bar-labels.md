---
'@human-kit/charts': minor
---

Add `labels` and `radius` to `Chart.Bar`. `labels` writes the value of each bar after its end, and the chart makes space for the labels. `radius` rounds the corners at the end of each bar, and keeps the corners at zero square.

A band axis now names each category that has room for one line of text. Before, a vertical band axis named only one category in each 32 pixels, thus a short horizontal bar chart showed only every second name.
