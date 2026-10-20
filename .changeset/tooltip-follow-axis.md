---
'@human-kit/charts': patch
---

A `Chart.Tooltip` that follows the pointer moves only along it, at the height of the point. The tooltip is centred with `translate` instead of `transform`, thus a CSS animation of `transform` no longer moves it to the side while it opens or closes.
