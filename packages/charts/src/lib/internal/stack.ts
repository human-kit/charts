/**
 * Puts the series one on the other. Each point has a `key` (the x value) and a `y` value. The
 * function returns the bottom and the top of each point, in the order of the input. Positive
 * values go up from zero and negative values go down from zero, each on their own stack.
 */
export function stack(
	series: ReadonlyArray<ReadonlyArray<{ key: string | number; y: number }>>
): [number, number][][] {
	const up = new Map<string | number, number>();
	const down = new Map<string | number, number>();
	return series.map((points) =>
		points.map(({ key, y }) => {
			const sums = y < 0 ? down : up;
			const base = sums.get(key) ?? 0;
			sums.set(key, base + y);
			return [base, base + y];
		})
	);
}
