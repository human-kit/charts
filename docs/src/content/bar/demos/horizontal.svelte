<script lang="ts">
	import { Chart } from '@human-kit/charts';
	import { scaleBand } from '@human-kit/charts/scales/band';

	type Language = { language: string; share: number };
	const data: Language[] = [
		{ language: 'TypeScript', share: 0.42 },
		{ language: 'JavaScript', share: 0.31 },
		{ language: 'Python', share: 0.14 },
		{ language: 'Go', share: 0.08 },
		{ language: 'Rust', share: 0.05 }
	];
</script>

<Chart.Root
	{data}
	x="share"
	y="language"
	yScale={{ type: scaleBand }}
	xFormat={{ style: 'percent' }}
	height={220}
	margin={{ top: 8, right: 16, bottom: 24, left: 80 }}
	class="demo-chart"
>
	<Chart.Title>Share of the code in the repository</Chart.Title>
	<Chart.Plot>
		<Chart.Grid axis="x" />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Bar />
	</Chart.Plot>
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
