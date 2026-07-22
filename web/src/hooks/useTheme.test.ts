import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useTheme } from './useTheme';

const STORAGE_KEY = 'typeseek-theme';

beforeEach(() => {
	localStorage.clear();
	document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
	localStorage.clear();
	document.documentElement.removeAttribute('data-theme');
});

describe('useTheme', () => {
	it('defaults to the system theme when nothing is stored', () => {
		const { result } = renderHook(() => useTheme());
		expect(result.current.theme).toBe('light');
		expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
	});

	it('a stored override wins over the system default', () => {
		localStorage.setItem(STORAGE_KEY, 'dark');
		const { result } = renderHook(() => useTheme());
		expect(result.current.theme).toBe('dark');
		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
	});

	it('toggling persists the new theme to localStorage and sets data-theme', () => {
		const { result } = renderHook(() => useTheme());

		act(() => {
			result.current.toggleTheme();
		});

		expect(result.current.theme).toBe('dark');
		expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

		act(() => {
			result.current.toggleTheme();
		});

		expect(result.current.theme).toBe('light');
		expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
	});
});
