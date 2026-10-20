---
'@human-kit/charts': patch
---

A `Chart.Tooltip` that follows the pointer stays in the nearest ancestor that clips it, not in the page: a page frame with `overflow: hidden` no longer cuts it.
