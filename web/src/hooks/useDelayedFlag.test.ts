import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDelayedFlag } from './useDelayedFlag';

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('useDelayedFlag', () => {
	it('stays false before the delay elapses', () => {
		const { result } = renderHook(() => useDelayedFlag(true, 4000));
		expect(result.current).toBe(false);

		act(() => {
			vi.advanceTimersByTime(3999);
		});
		expect(result.current).toBe(false);
	});

	it('flips true once the delay elapses while still active', () => {
		const { result } = renderHook(() => useDelayedFlag(true, 4000));

		act(() => {
			vi.advanceTimersByTime(4000);
		});
		expect(result.current).toBe(true);
	});

	it('resets to false immediately when no longer active, even mid-delay', () => {
		const { result, rerender } = renderHook(
			({ active }: { active: boolean }) => useDelayedFlag(active, 4000),
			{ initialProps: { active: true } }
		);

		act(() => {
			vi.advanceTimersByTime(2000);
		});
		rerender({ active: false });
		expect(result.current).toBe(false);

		act(() => {
			vi.advanceTimersByTime(4000);
		});
		expect(result.current).toBe(false);
	});
});
