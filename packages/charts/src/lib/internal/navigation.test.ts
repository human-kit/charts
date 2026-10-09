import { describe, expect, it } from 'vitest';
import { move } from './navigation.js';

const series = [[1, 2, 3, 4], [], [1, 3, 5]];

describe('move', () => {
	it('moves in a series and stops at the ends', () => {
		expect(move(series, { series: 0, index: 0 }, 'ArrowRight')).toEqual({ series: 0, index: 1 });
		expect(move(series, { series: 0, index: 0 }, 'ArrowLeft')).toBeNull();
		expect(move(series, { series: 0, index: 3 }, 'ArrowRight')).toBeNull();
		expect(move(series, { series: 0, index: 1 }, 'End')).toEqual({ series: 0, index: 3 });
		expect(move(series, { series: 0, index: 2 }, 'Home')).toEqual({ series: 0, index: 0 });
		expect(move(series, { series: 0, index: 0 }, 'PageDown')).toEqual({ series: 0, index: 3 });
	});

	it('moves between series to the closest x value, and skips an empty series', () => {
		expect(move(series, { series: 0, index: 3 }, 'ArrowDown')).toEqual({ series: 2, index: 1 });
		expect(move(series, { series: 2, index: 2 }, 'ArrowUp')).toEqual({ series: 0, index: 3 });
		expect(move(series, { series: 0, index: 0 }, 'ArrowUp')).toBeNull();
	});

	it('ignores other keys', () => {
		expect(move(series, { series: 0, index: 0 }, 'a')).toBeNull();
	});
});
