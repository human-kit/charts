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

/**
 * The `d` attribute of a filled area between two lines with the same x positions: along `top`,
 * back along `bottom`, and closed.
 */
export function areaPath(
	top: ReadonlyArray<readonly [number, number]>,
	bottom: ReadonlyArray<readonly [number, number]>
): string {
	if (!top.length) return '';
	return `${linePath(top)}L${linePath([...bottom].reverse()).slice(1)}Z`;
}
