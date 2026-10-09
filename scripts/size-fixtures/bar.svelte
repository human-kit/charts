<script lang="ts">
	import { Chart } from '../../packages/charts/src/lib/index.js';
	import { scaleBand } from '../../packages/charts/src/lib/scales/band.js';

	let { data }: { data: { x: string; y: number; s: string }[] } = $props();
</script>

<Chart.Root {data} x="x" y="y" series="s" xScale={{ type: scaleBand }} aria-label="Bars">
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Bar layout="stacked" />
	</Chart.Plot>
</Chart.Root>
