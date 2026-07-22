import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'typeseek-theme';

function getSystemTheme(): Theme {
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme | null {
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored === 'light' || stored === 'dark' ? stored : null;
}

function applyTheme(theme: Theme | null) {
	if (theme) {
		document.documentElement.setAttribute('data-theme', theme);
	} else {
		document.documentElement.removeAttribute('data-theme');
	}
}

const THEME_COLOR = { dark: '#202126', light: '#ebe5d9' } as const;

function applyThemeColorMeta(theme: Theme) {
	document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}

/** Resolves to the stored override if the user has picked one, otherwise the live system preference. */
export function useTheme() {
	const [stored, setStored] = useState<Theme | null>(() => getStoredTheme());
	const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);

	useEffect(() => {
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = () => setSystemTheme(media.matches ? 'dark' : 'light');
		media.addEventListener('change', handler);
		return () => media.removeEventListener('change', handler);
	}, []);

	useEffect(() => {
		applyTheme(stored);
	}, [stored]);

	const theme = stored ?? systemTheme;

	useEffect(() => {
		applyThemeColorMeta(theme);
	}, [theme]);

	const toggleTheme = () => {
		const next: Theme = theme === 'dark' ? 'light' : 'dark';
		localStorage.setItem(STORAGE_KEY, next);
		setStored(next);
	};

	return { theme, toggleTheme };
}
