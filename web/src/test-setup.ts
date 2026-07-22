import '@testing-library/jest-dom/vitest';

if (!window.matchMedia) {
	window.matchMedia = (query: string) =>
		({
			matches: false,
			media: query,
			onchange: null,
			addEventListener: () => {},
			removeEventListener: () => {},
			addListener: () => {},
			removeListener: () => {},
			dispatchEvent: () => false,
		}) as unknown as MediaQueryList;
}

if (!document.fonts) {
	Object.defineProperty(document, 'fonts', {
		value: { load: () => Promise.resolve([]) },
		configurable: true,
	});
} else if (!document.fonts.load) {
	document.fonts.load = () => Promise.resolve([]);
}
