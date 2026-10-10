import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import LineTest from './line-test.svelte';

function points() {
	return [...document.querySelectorAll<SVGCircleElement>('[data-point]')];
}

function focusedText() {
	return document.querySelector('[data-testid="focused"]')?.textContent;
}

describe('Chart.Line', () => {
	it('names the chart from the title, and each point from its values', () => {
		render(LineTest);
		const plot = document.querySelector('[data-testid="plot"]')!;
		const title = document.querySelector('figcaption')!;

		expect(plot.getAttribute('role')).toBe('application');
		expect(plot.getAttribute('aria-roledescription')).toBe('chart');
		expect(plot.getAttribute('aria-labelledby')).toBe(title.id);
		expect(points().map((p) => p.getAttribute('aria-label'))).toEqual([
			'1, A, 10',
			'2, A, 20',
			'3, A, 15',
			'1, B, 5',
			'3, B, 8'
		]);
		expect(document.querySelector('[data-line]')!.getAttribute('aria-hidden')).toBe('true');
	});

	it('makes one tab stop, on the first point', async () => {
		render(LineTest);
		expect(points().map((p) => p.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1', '-1']);

		(document.querySelector('[data-testid="before"]') as HTMLElement).focus();
		await userEvent.tab();
		expect(document.activeElement).toBe(points()[0]);
		await userEvent.tab();
		expect(document.activeElement).toBe(document.querySelector('[data-testid="after"]'));
	});

	it('moves the focus with the arrows, Home and End', async () => {
		render(LineTest);
		points()[0].focus();

		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(points()[1]);
		await userEvent.keyboard('{End}');
		expect(document.activeElement).toBe(points()[2]);
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(points()[2]);
		await userEvent.keyboard('{Home}');
		expect(document.activeElement).toBe(points()[0]);
	});

	it('moves between series to the closest x value', async () => {
		render(LineTest);
		points()[2].focus();

		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(points()[4]);
		await userEvent.keyboard('{ArrowUp}');
		expect(document.activeElement).toBe(points()[2]);
	});

	it('keeps the tab stop on the last focused point', async () => {
		render(LineTest);
		points()[0].focus();
		await userEvent.keyboard('{ArrowRight}');
		await tick();

		expect(points()[1].getAttribute('tabindex')).toBe('0');
		expect(points()[0].getAttribute('tabindex')).toBe('-1');
	});

	it('shows the focus state, and writes the focused point', async () => {
		render(LineTest);
		const figure = document.querySelector('figure')!;
		(document.querySelector('[data-testid="before"]') as HTMLElement).focus();
		await userEvent.tab();

		expect(points()[0].dataset.focused).toBe('true');
		expect(points()[0].dataset.focusVisible).toBe('true');
		expect(figure.dataset.focusWithin).toBe('true');
		expect(figure.dataset.focusVisible).toBe('true');
		expect(focusedText()).toBe('A:1');

		await userEvent.tab();
		expect(points()[0].dataset.focused).toBeUndefined();
		expect(figure.dataset.focusWithin).toBeUndefined();
		expect(focusedText()).toBe('');
	});

	it('shows no focus ring after a pointer press', async () => {
		render(LineTest);
		await userEvent.click(points()[1]);

		expect(document.activeElement).toBe(points()[1]);
		expect(points()[1].dataset.focused).toBe('true');
		expect(points()[1].dataset.focusVisible).toBeUndefined();

		await userEvent.keyboard('{ArrowRight}');
		expect(points()[2].dataset.focusVisible).toBe('true');
	});

	it('selects a point with Enter, Space and a click', async () => {
		const onSelect = vi.fn();
		render(LineTest, { onSelect });
		points()[0].focus();

		await userEvent.keyboard('{Enter}');
		await userEvent.keyboard(' ');
		await userEvent.click(points()[3]);

		expect(onSelect.mock.calls.map(([p]) => `${p.series}:${p.x}`)).toEqual(['A:1', 'A:1', 'B:1']);
		expect(onSelect.mock.calls[2][0].datum).toEqual({ x: 1, y: 5, s: 'B' });
	});

	it('selects the nearest point with a click or a tap near it', async () => {
		const onSelect = vi.fn();
		render(LineTest, { onSelect });
		const plot = document.querySelector('svg')!;
		const point = points()[3];
		// 12 pixels from a point of 3 pixels: on the plot, not on the point.
		await userEvent.click(plot, {
			position: { x: Number(point.getAttribute('cx')) + 12, y: Number(point.getAttribute('cy')) }
		});
		expect(onSelect.mock.calls.map(([p]) => `${p.series}:${p.x}`)).toEqual(['B:1']);
	});

	it('breaks the line at a row without a value, and gives that row no focus', () => {
		render(LineTest, {
			data: [
				{ x: 1, y: 1, s: 'A' },
				{ x: 2, y: null, s: 'A' },
				{ x: 3, y: 3, s: 'A' }
			]
		});

		expect(points()).toHaveLength(2);
		expect(document.querySelector('[data-line]')!.getAttribute('d')).toMatch(/^M[^ML]*M[^ML]*$/);
	});
});
