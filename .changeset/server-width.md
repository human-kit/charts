---
'@human-kit/charts': patch
---

Without a `width` prop, the SVG of `Chart.Plot` has `width="100%"` until the first measure. Before, the server made an SVG of 640 pixels, and on a narrow screen the page was wider than the screen until the hydration. Now the browser scales the chart to its container, and the height does not change.
