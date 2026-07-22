import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDelayedUnmount } from './useDelayedUnmount';

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('useDelayedUnmount', () => {
	it('renders immediately when open', () => {
		const { result } = renderHook(() => useDelayedUnmount(true, 300));
		expect(result.current).toBe(true);
	});

	it('keeps rendering during the exit delay after closing', () => {
		const { result, rerender } = renderHook(
			({ isOpen }: { isOpen: boolean }) => useDelayedUnmount(isOpen, 300),
			{ initialProps: { isOpen: true } }
		);

		rerender({ isOpen: false });
		expect(result.current).toBe(true);

		act(() => {
			vi.advanceTimersByTime(299);
		});
		expect(result.current).toBe(true);
	});

	it('stops rendering once the exit delay elapses', () => {
		const { result, rerender } = renderHook(
			({ isOpen }: { isOpen: boolean }) => useDelayedUnmount(isOpen, 300),
			{ initialProps: { isOpen: true } }
		);

		rerender({ isOpen: false });

		act(() => {
			vi.advanceTimersByTime(300);
		});
		expect(result.current).toBe(false);
	});

	it('re-opens immediately if isOpen flips back true before the delay elapses', () => {
		const { result, rerender } = renderHook(
			({ isOpen }: { isOpen: boolean }) => useDelayedUnmount(isOpen, 300),
			{ initialProps: { isOpen: true } }
		);

		rerender({ isOpen: false });
		act(() => {
			vi.advanceTimersByTime(150);
		});
		rerender({ isOpen: true });

		act(() => {
			vi.advanceTimersByTime(300);
		});
		expect(result.current).toBe(true);
	});
});
