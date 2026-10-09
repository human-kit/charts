/** Two decimals are below the precision of a screen, and they keep the markup short. */
export function round(value: number): number {
	return Math.round(value * 100) / 100;
}

/**
 * The `d` attribute of a polyline through the points. A point with a value that is not finite
 * makes a gap: the line stops before it and starts again after it.
 */
export function linePath(points: ReadonlyArray<readonly [number, number]>): string {
	let d = '';
	let open = false;
	for (const [x, y] of points) {
		if (!Number.isFinite(x) || !Number.isFinite(y)) {
			open = false;
			continue;
		}
		d += `${open ? 'L' : 'M'}${round(x)},${round(y)}`;
		open = true;
	}
	return d;
}
