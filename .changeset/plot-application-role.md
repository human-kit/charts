---
'@human-kit/charts': patch
---

The plot now has `role="application"`. A screen reader in browse mode kept the arrow keys for its own reading, thus the keyboard of the chart did not operate. With NVDA, the arrow keys now move the focus through the points, and NVDA reads each point.
