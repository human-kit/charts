import { describe, expect, it } from 'vitest';
import { areaPath, linePath } from './path.js';
import { groupRows, isValue } from './series.js';

describe('isValue', () => {
	it('accepts categories, finite numbers and valid dates', () => {
		expect([isValue('a'), isValue(''), isValue(0), isValue(new Date(0))]).toEqual([
			true,
			true,
			true,
			true
		]);
	});

	it('rejects values without a position', () => {
		const values = [null, undefined, NaN, Infinity, true, new Date('x'), {}];
		expect(values.map(isValue)).toEqual(values.map(() => false));
	});
});

describe('groupRows', () => {
	type Row = { t: number; v: number | null; s: string };
	const rows: Row[] = [
		{ t: 1, v: 1, s: 'a' },
		{ t: 2, v: null, s: 'a' },
		{ t: 2, v: 5, s: 'b' },
		{ t: 3, v: 3, s: 'a' },
		{ t: 4, v: 4, s: 'a' }
	];

	it('gives a row without a value no point, and breaks the series after it', () => {
		const [a, b] = groupRows(rows, 't', 'v', 's');
		expect(a.points.map((p) => p.index)).toEqual([0, 3, 4]);
		expect(a.breaks).toEqual([1]);
		expect(b.breaks).toEqual([]);
	});

	it('does not break a series before its first point or after its last point', () => {
		const edges: Row[] = [
			{ t: 1, v: null, s: 'a' },
			{ t: 2, v: 2, s: 'a' },
			{ t: 3, v: 3, s: 'a' },
			{ t: 4, v: null, s: 'a' }
		];
		expect(groupRows(edges, 't', 'v', 's')[0].breaks).toEqual([]);
	});
});

describe('paths', () => {
	const points: [number, number][] = [
		[0, 0],
		[1, 1],
		[2, 2],
		[3, 3]
	];

	it('starts a new line at each break', () => {
		expect(linePath(points, [2])).toBe('M0,0L1,1M2,2L3,3');
	});

	it('closes an area for each part between the breaks', () => {
		const bottom = points.map(([x]): [number, number] => [x, 9]);
		expect(areaPath(points, bottom, [2])).toBe('M0,0L1,1L1,9L0,9ZM2,2L3,3L3,9L2,9Z');
		expect(areaPath([], [])).toBe('');
	});
});
