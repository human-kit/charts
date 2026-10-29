<script lang="ts">
	import { Chart } from '../../packages/charts/src/lib/index.js';
	import { scaleBand } from '../../packages/charts/src/lib/scales/band.js';

	let { data }: { data: { x: string; y: number }[] } = $props();
</script>

<Chart.Root {data} x="x" y="y" xScale={{ type: scaleBand }} aria-label="Donut">
	<Chart.Plot>
		<Chart.Arc inner={0.6} />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.DataTable />
</Chart.Root>
