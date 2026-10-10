---
'@human-kit/charts': minor
---

`Chart.Line`, `Chart.Area` and `Chart.Bar` get a `name` prop. It names the series of a mark without a series channel. The legend, the names of the points and the data table show it. Give each mark a `name` when two marks show two fields of the same rows: a point is then "2015, Cost, 40" and not "2015, 40", and the data table shows the two fields.
