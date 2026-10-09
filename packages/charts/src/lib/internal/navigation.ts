/** The place of a point: the index of its series, and its index in that series. */
export type Position = { series: number; index: number };

/** The number of points that `PageUp` and `PageDown` move. */
export const PAGE = 10;

/** The x value closest to `x` in `values`. Returns its index, or -1 for an empty list. */
function nearest(values: readonly number[], x: number): number {
	let best = -1;
	let distance = Infinity;
	for (let i = 0; i < values.length; i++) {
		const d = Math.abs(values[i] - x);
		if (d < distance) [best, distance] = [i, d];
	}
	return best;
}

/**
 * The position after a key press, or `null` when the key does not move the focus. `series`
 * holds the x values of the points of each series, in the order of the keyboard.
 *
 * The keys do not wrap: at the end of a series, `ArrowRight` does nothing.
 */
export function move(
	series: ReadonlyArray<readonly number[]>,
	from: Position,
	key: string
): Position | null {
	const points = series[from.series];
	if (!points?.length) return null;
	const last = points.length - 1;
	let index = from.index;
	switch (key) {
		case 'ArrowRight':
			index++;
			break;
		case 'ArrowLeft':
			index--;
			break;
		case 'PageDown':
			index += PAGE;
			break;
		case 'PageUp':
			index -= PAGE;
			break;
		case 'Home':
			index = 0;
			break;
		case 'End':
			index = last;
			break;
		case 'ArrowDown':
		case 'ArrowUp': {
			const step = key === 'ArrowDown' ? 1 : -1;
			// Skip the series without points.
			for (let s = from.series + step; s >= 0 && s < series.length; s += step) {
				const target = nearest(series[s], points[from.index]);
				if (target >= 0) return { series: s, index: target };
			}
			return null;
		}
		default:
			return null;
	}
	index = Math.max(0, Math.min(last, index));
	return index === from.index ? null : { series: from.series, index };
}
