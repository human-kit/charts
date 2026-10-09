# @human-kit/charts

This is a set of headless chart components for **Svelte 5**. Each component gives
you the behavior: the scales, the geometry, the keyboard operation, the focus
control and the accessible names. No component gives you a style. You write all
of the CSS.

> **Status: prototype.** The package is not on npm yet. The public API can
> change. The design is in [`rfcs/0001-architecture.md`](./rfcs/0001-architecture.md).

## Why this library

- **Accessibility is the primary function.** A chart is one tab stop, and the
  arrow keys move the focus over the data. Each point has an accessible name
  with all of its values. `Chart.DataTable` gives the same data as a table.
- **Size is the second function.** The library has no runtime dependency. Each
  scale has its own subpath export, and a chart includes only the parts that it
  imports. CI measures the size of each change.
- **A chart is a composition of marks.** You put a line, an area or bars on
  shared scales. Each mark can have its own data.
- **The components show their state in `data-*` attributes**, for example
  `data-series`, `data-focused` and `data-selected`.

## Example

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/charts';
	import { scaleTime } from '@human-kit/charts/scales/time';

	type Sale = { month: Date; region: string; revenue: number };
	let { sales }: { sales: Sale[] } = $props();
</script>

<Chart.Root data={sales} x="month" y="revenue" series="region" xScale={{ type: scaleTime }}>
	<Chart.Title>Revenue per month</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" label="Revenue (USD)" />
		<Chart.Line />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
```

## Parts

| Group  | Parts                                                          |
| ------ | -------------------------------------------------------------- |
| Root   | `Chart.Root`, `Chart.Title`, `Chart.Plot`                      |
| Marks  | `Chart.Line`, `Chart.Area`, `Chart.Bar`                        |
| Guides | `Chart.Axis`, `Chart.Grid`, `Chart.Legend`                     |
| Access | `Chart.Tooltip`, `Chart.DataTable`                             |
| Scales | `scaleLinear`, `scaleTime`, `scaleBand` (one subpath for each) |

## Repository layout

- `packages/charts/`: the publishable package, `@human-kit/charts`.
- `rfcs/`: the design documents.
- `scripts/`: the size measure and its fixtures.

## Development

```bash
pnpm install
pnpm dev          # the playground
pnpm test         # the browser tests
pnpm test:ssr     # the server tests
pnpm size         # the gzip size of the fixtures
```

## License

MIT
