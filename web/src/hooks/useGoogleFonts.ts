import { useEffect, useState } from 'react';

const LOAD_FALLBACK_TIMEOUT_MS = 3000;
const KEY_SEPARATOR = ' ';

const requestedFamilies = new Set<string>();

/** Loads font families from Google Fonts and reports once they've actually finished (not just requested). */
export function useGoogleFonts(fontNames: string[]): boolean {
	const key = fontNames.join(KEY_SEPARATOR);

	const [ready, setReady] = useState(fontNames.length === 0);
	const [trackedKey, setTrackedKey] = useState(key);

	if (key !== trackedKey) {
		setTrackedKey(key);
		setReady(fontNames.length === 0);
	}

	useEffect(() => {
		if (fontNames.length === 0) return;

		let cancelled = false;

		const newFamilies = fontNames.filter(
			(name) => !requestedFamilies.has(name)
		);
		newFamilies.forEach((name) => requestedFamilies.add(name));

		const waitForFonts = () => {
			Promise.all(
				fontNames.map((name) => document.fonts.load(`16px "${name}"`))
			)
				.catch(() => {})
				.finally(() => {
					if (!cancelled) setReady(true);
				});
		};

		const fallback = setTimeout(() => {
			if (!cancelled) setReady(true);
		}, LOAD_FALLBACK_TIMEOUT_MS);

		if (newFamilies.length === 0) {
			waitForFonts();
		} else {
			const query = newFamilies
				.map(
					(name) => `family=${encodeURIComponent(name).replace(/%20/g, '+')}`
				)
				.join('&');
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
			link.addEventListener('load', waitForFonts, { once: true });
			document.head.appendChild(link);
		}

		return () => {
			cancelled = true;
			clearTimeout(fallback);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key]);

	return ready;
}
