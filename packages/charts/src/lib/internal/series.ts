import type { ChartPoint, ChartSeries, ChartValue } from '../root/context.js';
import { read, type Channel } from './channel.js';

/** Whether a value can have a position: a category, a date, or a finite number. */
export function isValue(value: unknown): value is ChartValue {
	return typeof value === 'string' || Number.isFinite(+(value as number));
}

/**
 * The rows as series of points, in the order of their first appearance. A row without a valid x
 * or y value has no point: it is a gap in a line, and it takes no focus.
 */
export function groupRows<T>(
	rows: readonly T[],
	x: Channel<T, ChartValue> | undefined,
	y: Channel<T, ChartValue> | undefined,
	series: Channel<T, string> | undefined
): ChartSeries<T>[] {
	const out = new Map<string, ChartPoint<T>[]>();
	if (!x || !y) return [];
	rows.forEach((datum, index) => {
		const point = {
			datum,
			index,
			series: series ? String(read(series, datum, index)) : '',
			x: read(x, datum, index),
			y: read(y, datum, index)
		};
		if (!isValue(point.x) || !isValue(point.y)) return;
		let points = out.get(point.series);
		if (!points) out.set(point.series, (points = []));
		points.push(point);
	});
	return [...out].map(([name, points]) => ({ name, points }));
}

/** A key of a value for a stack: the same category, date or number gives the same key. */
export function stackKey(value: ChartValue): string | number {
	return typeof value === 'string' ? value : +value;
}
