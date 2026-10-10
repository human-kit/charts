---
'@human-kit/charts': patch
---

The charts work better on a touch screen and on a narrow screen:

- A tap opens the tooltip on the nearest point, and it stays when the finger lifts. A tap out of the plot, or a finger that scrolls the page, closes it.
- A click or a tap less than 40 pixels from a point selects it.
- The tooltip stays in the width of the figure.
- An axis measures its labels again when a web font loads. Before, the labels could be cut.
- A band axis shows each category while each one has 32 pixels. Before, it used the spacing of a number axis and skipped categories.
