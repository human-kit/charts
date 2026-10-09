/** The options of `Intl.NumberFormat` for numbers, and of `Intl.DateTimeFormat` for dates. */
export type FormatOptions = Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;

/**
 * A function that maps a value of the data to a position in pixels. The value is a number; a
 * date is its time in milliseconds.
 */
export type Scale = {
	(value: number): number;
	/** The name of the type of scale. */
	readonly kind: string;
	/** The values at the two ends of the scale. */
	readonly domain: readonly [number, number];
	/** The positions, in pixels, of the two ends of the scale. */
	readonly range: readonly [number, number];
	/** The position back to a value. */
	invert(position: number): number;
	/** Round values in the domain, about `count` of them. */
	ticks(count?: number): number[];
	/** The function that writes the labels of the ticks that `ticks(count)` gives. */
	tickFormat(count?: number, locale?: string): (value: number) => string;
	/**
	 * The function that writes a value in full, for the names of the points and the data table.
	 * `values` are all of the values of the channel. Without `options`, a time scale chooses the
	 * precision from them.
	 */
	valueFormat(
		values: number[],
		locale?: string,
		options?: FormatOptions
	): (value: number) => string;
	/** The domain, extended to round values. */
	nice(count?: number): [number, number];
};

/** A function that makes a scale from a domain and a range. */
export type ScaleType = (
	domain: readonly [number, number],
	range: readonly [number, number]
) => Scale;
