import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGoogleFonts } from './useGoogleFonts';

// Unique names per test so the module-level dedup Set doesn't leak state across tests.
let counter = 0;
function uniqueFontName() {
	counter += 1;
	return `TestFont${counter}`;
}

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
	document.head.querySelectorAll('link').forEach((link) => link.remove());
});

describe('useGoogleFonts', () => {
	it('is ready immediately when no font names are requested', () => {
		const { result } = renderHook(() => useGoogleFonts([]));
		expect(result.current).toBe(true);
	});

	it('is not ready until the fallback timeout elapses', async () => {
		const name = uniqueFontName();
		const { result } = renderHook(() => useGoogleFonts([name]));

		expect(result.current).toBe(false);

		await act(async () => {
			vi.advanceTimersByTime(3000);
		});

		expect(result.current).toBe(true);
	});

	it('only injects one <link> per family across two hook instances requesting the same font', () => {
		const name = uniqueFontName();
		renderHook(() => useGoogleFonts([name]));
		renderHook(() => useGoogleFonts([name]));

		const links = document.head.querySelectorAll(
			`link[href*="${encodeURIComponent(name)}"]`
		);
		expect(links.length).toBe(1);
	});

	it('flips ready back to false synchronously on the same render the requested font set changes', () => {
		const first = uniqueFontName();
		const second = uniqueFontName();

		const { result, rerender } = renderHook(
			({ names }: { names: string[] }) => useGoogleFonts(names),
			{ initialProps: { names: [first] } }
		);

		act(() => {
			vi.advanceTimersByTime(3000);
		});
		expect(result.current).toBe(true);

		rerender({ names: [second] });

		// Must already be false on this same render pass — not one render later.
		expect(result.current).toBe(false);
	});
});
