<script lang="ts">
	import { channelName } from '../internal/channel.js';
	import { useChartContext, type ChartPoint } from '../root/context.js';
	import type { ChartDataTableProps } from '../types.js';

	let {
		visibility = 'screen-reader',
		caption,
		rowHeader,
		class: className = '',
		...restProps
	}: ChartDataTableProps = $props();

	const ctx = useChartContext('Chart.DataTable');

	// The rows follow the axis of the categories: x, or y for a mark with horizontal bars.
	const horizontal = $derived(ctx.marks[0]?.horizontal?.() ?? false);

	// A row per key value and a column per series. Two marks with one series name make one column.
	const table = $derived.by(() => {
		const keyOf = (p: ChartPoint) => (horizontal ? ctx.toY(p.y) : ctx.toX(p.x));
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a scratch map for one pass.
		const columns = new Map<string, Map<number, ChartPoint>>();
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a scratch set for one pass.
		const keys = new Set<number>();
		for (const mark of ctx.marks) {
			for (const s of mark.read()) {
				if (columns.has(s.name)) continue;
				const cells = new Map(s.points.map((p) => [keyOf(p), p]));
				columns.set(s.name, cells);
				for (const key of cells.keys()) keys.add(key);
			}
		}
		const names = [...columns.keys()];
		const rows = [...keys]
			.sort((a, b) => a - b)
			.map((key) => ({
				header: horizontal ? ctx.formatY(key) : ctx.formatX(key),
				cells: names.map((name) => columns.get(name)!.get(key))
			}));
		return { names, rows };
	});

	function text(point: ChartPoint | undefined) {
		if (!point) return '';
		return horizontal ? ctx.formatX(ctx.toX(point.x)) : ctx.formatY(ctx.toY(point.y));
	}

	// One series without a name has the name of the value channel as its column header.
	const valueName = $derived(horizontal ? channelName(ctx.x, 'x') : channelName(ctx.y, 'y'));
	const keyName = $derived(horizontal ? channelName(ctx.y, 'y') : channelName(ctx.x, 'x'));
	const headers = $derived(table.names.map((name) => name || valueName));
	// Without a caption, the title of the chart names the table.
	const labelledBy = $derived(caption ? undefined : (ctx.titleId ?? undefined));

	// The styles remove the table from the screen, but not from the accessibility tree.
	const HIDDEN =
		'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0';
</script>

<table
	class={className}
	data-data-table=""
	data-visibility={visibility}
	aria-labelledby={labelledBy}
	style={visibility === 'screen-reader' ? HIDDEN : undefined}
	{...restProps}
>
	{#if caption}<caption>{caption}</caption>{/if}
	<thead>
		<tr>
			<th scope="col">{rowHeader ?? keyName}</th>
			{#each headers as header, i (i)}
				<th scope="col">{header}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each table.rows as row, r (r)}
			<tr>
				<th scope="row">{row.header}</th>
				{#each row.cells as point, i (i)}
					{@const current = point && ctx.isSelected(point) ? 'true' : undefined}
					<td aria-current={current} data-selected={current}>{text(point)}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
