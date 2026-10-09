<script lang="ts">
	import { Chart, type ChartPoint } from '$lib/index.js';
	import { scaleTime } from '$lib/scales/time.js';
	import { scaleBand } from '$lib/scales/band.js';

	type Row = { year: Date; region: string; revenue: number };
	const regions = ['North', 'South', 'East'];
	const data: Row[] = regions.flatMap((region, r) =>
		Array.from({ length: 12 }, (_, i) => ({
			year: new Date(2014 + i, 0, 1),
			region,
			revenue: Math.round(40 + r * 15 + i * (3 + r) + Math.sin(i + r) * 8)
		}))
	);

	type Sale = { quarter: string; region: string; sales: number };
	const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
	const sales: Sale[] = regions.flatMap((region, r) =>
		quarters.map((quarter, q) => ({
			quarter,
			region,
			sales: 20 + r * 8 + q * 6 - (q === 2 ? 15 : 0)
		}))
	);
	let layout: 'grouped' | 'stacked' = $state('grouped');

	let focused: ChartPoint<Row> | null = $state(null);
	let selected: ChartPoint<Row> | null = $state(null);
</script>

<main>
	<h1>Playground</h1>
	<p>Tab into the chart. The arrows move the focus. Enter selects a point.</p>

	<Chart.Root
		{data}
		x="year"
		y="revenue"
		series="region"
		xScale={{ type: scaleTime }}
		yFormat={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
		height={320}
		bind:focused
		onSelect={(point) => (selected = point)}
		class="chart"
	>
		<Chart.Title>Revenue per region, 2014 to 2025</Chart.Title>
		<Chart.Plot>
			<Chart.Grid axis="y" class="grid" />
			<Chart.Axis position="bottom" />
			<Chart.Axis position="left" label="Revenue (USD)" />
			<Chart.Line />
		</Chart.Plot>
	</Chart.Root>

	<p>Focused: {focused ? `${focused.datum.region} ${focused.datum.year.getFullYear()}` : 'none'}</p>
	<p>
		Selected: {selected ? `${selected.datum.region} ${selected.datum.year.getFullYear()}` : 'none'}
	</p>

	<h2>Bars</h2>
	<label>
		<input
			type="checkbox"
			checked={layout === 'stacked'}
			onchange={(event) => (layout = event.currentTarget.checked ? 'stacked' : 'grouped')}
		/>
		Stacked
	</label>
	<Chart.Root
		data={sales}
		x="quarter"
		y="sales"
		series="region"
		xScale={{ type: scaleBand }}
		height={280}
		class="chart"
	>
		<Chart.Title>Sales per quarter and region</Chart.Title>
		<Chart.Plot>
			<Chart.Grid axis="y" class="grid" />
			<Chart.Axis position="bottom" />
			<Chart.Axis position="left" label="Sales (units)" />
			<Chart.Bar {layout} />
		</Chart.Plot>
	</Chart.Root>
</main>

<style>
	main {
		max-width: 48rem;
		margin: 2rem auto;
		padding: 0 1rem;
		font-family: system-ui, sans-serif;
	}
	:global(.chart) {
		margin: 0;
		font-size: 12px;
	}
	:global(.chart .grid) {
		color: #e5e7eb;
	}
	:global(.chart [data-series='North']) {
		color: #2563eb;
	}
	:global(.chart [data-series='South']) {
		color: #d97706;
	}
	:global(.chart [data-series='East']) {
		color: #059669;
	}
	:global(.chart [data-line]) {
		stroke-width: 2;
	}
	:global(.chart [data-point]) {
		outline: none;
	}
	:global(.chart [data-point][data-focused]) {
		r: 6;
	}
	:global(.chart [data-bar][data-focused]) {
		opacity: 0.8;
	}
	:global(.chart [data-point][data-focus-visible]) {
		stroke: CanvasText;
		stroke-width: 2;
	}
</style>
