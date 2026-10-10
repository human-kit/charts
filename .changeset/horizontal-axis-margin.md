---
'@human-kit/charts': patch
---

An axis next to a band scale on y now measures its labels correctly. Before, a chart with horizontal bars and no `margin` did not stop updating after the mount.
