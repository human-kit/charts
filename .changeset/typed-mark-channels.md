---
'@human-kit/charts': minor
---

A mark can have its own `x`, `y` and `series` only when it has its own `data`. Before, the types did not check a channel on a mark without `data`, thus a wrong field name was not an error. Now a channel on a mark without `data` is a type error. To show a second field of the root rows, give the rows to the mark again: `<Chart.Line data={sales} y="cost" />`.
