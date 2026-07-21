import LocomotiveScroll from 'locomotive-scroll';
import { useEffect, type RefObject } from 'react';

export function useLocomotiveScroll(
	containerRef: RefObject<HTMLDivElement | null>
) {
	useEffect(() => {
		const wrapper = containerRef.current;
		const content = wrapper?.firstElementChild as HTMLElement | null;
		if (!wrapper || !content) return;

		const scroll = new LocomotiveScroll({
			lenisOptions: { wrapper, content },
		});

		return () => scroll.destroy();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
}
