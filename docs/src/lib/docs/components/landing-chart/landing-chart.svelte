<script lang="ts">
	import { Chart } from '@human-kit/charts';
	import { scaleTime } from '@human-kit/charts/scales/time';

	// The live chart of the landing page: two series, both scales, and every
	// access part, so a reader can Tab into it and try the keyboard at once.
	type Visit = { month: Date; site: string; visits: number };
	const visits: Record<string, number[]> = {
		Docs: [12, 15, 14, 18, 22, 21, 25, 27, 26, 30, 33, 35],
		Blog: [8, 9, 11, 10, 12, 14, 13, 15, 17, 16, 18, 20]
	};
	const data: Visit[] = Object.entries(visits).flatMap(([site, values]) =>
		values.map((value, i) => ({ month: new Date(2025, i, 1), site, visits: value }))
	);
</script>

<Chart.Root
	{data}
	x="month"
	y="visits"
	series="site"
	xScale={{ type: scaleTime }}
	height={260}
	class="demo-chart"
>
	<Chart.Title>Visits per month in 2025, in thousands</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Line />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
