import type { ChartSeries, ChartValue } from '../root/context.js';
import { read, type Channel } from './channel.js';

/**
 * Whether a value can have a position: a category, a valid date, or a finite number. `null`,
 * `undefined` and other types have no position: they are not zero.
 */
export function isValue(value: unknown): value is ChartValue {
	if (typeof value === 'string') return true;
	return (typeof value === 'number' || value instanceof Date) && Number.isFinite(+value);
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
	const out = new Map<string, ChartSeries<T>>();
	// The series that have a row without a value after their last point.
	const open = new Set<string>();
	if (!x || !y) return [];
	rows.forEach((datum, index) => {
		const name = series ? String(read(series, datum, index) ?? '') : '';
		const [xv, yv] = [read(x, datum, index), read(y, datum, index)];
		let group = out.get(name);
		if (!isValue(xv) || !isValue(yv)) {
			if (group?.points.length) open.add(name);
			return;
		}
		const point = { datum, index, series: name, x: xv, y: yv };
		if (!group) out.set(name, (group = { name, points: [], breaks: [] }));
		if (open.delete(name)) group.breaks.push(group.points.length);
		group.points.push(point);
	});
	return [...out.values()];
}

/** A key of a value for a stack: the same category, date or number gives the same key. */
export function stackKey(value: ChartValue): string | number {
	return typeof value === 'string' ? value : +value;
}
