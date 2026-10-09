import { describe, expect, it } from 'vitest';
import { stack } from './stack.js';

describe('stack', () => {
	it('puts the series one on the other for each key', () => {
		expect(
			stack([
				[
					{ key: 'A', y: 1 },
					{ key: 'B', y: 2 }
				],
				[
					{ key: 'A', y: 3 },
					{ key: 'B', y: 4 }
				]
			])
		).toEqual([
			[
				[0, 1],
				[0, 2]
			],
			[
				[1, 4],
				[2, 6]
			]
		]);
	});

	it('stacks negative values down from zero', () => {
		expect(stack([[{ key: 1, y: 2 }], [{ key: 1, y: -3 }], [{ key: 1, y: -1 }]])).toEqual([
			[[0, 2]],
			[[0, -3]],
			[[-3, -4]]
		]);
	});
});
