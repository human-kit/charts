<script lang="ts">
	import { Chart } from '../../packages/charts/src/lib/index.js';
	import { scaleTime } from '../../packages/charts/src/lib/scales/time.js';

	let { data }: { data: { x: Date; y: number; s: string }[] } = $props();
</script>

<Chart.Root {data} x="x" y="y" series="s" xScale={{ type: scaleTime }}>
	<Chart.Title>Full</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" label="Value" />
		<Chart.Area stacked />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
