import { useEffect, useRef, useState } from 'react';
import type { FontResult } from '../api/types';
import { useLocomotiveScroll } from '../hooks/useLocomotiveScroll';
import { FontCard } from './FontCard';

interface ResultGridProps {
	results: FontResult[];
	onSelect: (id: number) => void;
	compact?: boolean;
	scrollable?: boolean;
	height?: number;
}

export function ResultGrid({
	results,
	onSelect,
	compact,
	scrollable,
	height = 400,
}: ResultGridProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [remaining, setRemaining] = useState(0);

	useLocomotiveScroll(scrollRef);

	useEffect(() => {
		if (!scrollable) return;
		const el = scrollRef.current;
		if (!el || results.length === 0) return;

		const updateRemaining = () => {
			const { scrollTop, scrollHeight, clientHeight } = el;
			if (scrollHeight <= clientHeight) {
				setRemaining(0);
				return;
			}
			const hiddenBelow = scrollHeight - (scrollTop + clientHeight);
			const perItem = scrollHeight / results.length;
			setRemaining(Math.max(0, Math.round(hiddenBelow / perItem)));
		};

		updateRemaining();
		el.addEventListener('scroll', updateRemaining);
		window.addEventListener('resize', updateRemaining);
		return () => {
			el.removeEventListener('scroll', updateRemaining);
			window.removeEventListener('resize', updateRemaining);
		};
	}, [scrollable, results, height]);

	const grid = (
		<div className="border-line-faint flex flex-col overflow-hidden rounded-sm border">
			{results.map((font) => (
				<FontCard
					key={font.id}
					font={font}
					onSelect={onSelect}
					compact={compact}
				/>
			))}
		</div>
	);

	if (!scrollable) return grid;

	return (
		<div className="flex flex-col">
			<div
				className="[&::-webkit-scrollbar-thumb]:bg-line [&::-webkit-scrollbar-thumb:hover]:bg-muted scrollbar-thin overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-track]:bg-transparent"
				ref={scrollRef}
				style={{ height }}
			>
				{grid}
			</div>
			{remaining > 0 && (
				<div className="text-muted mt-1.5 px-1 text-right text-[0.7rem]">
					+{remaining} more
				</div>
			)}
		</div>
	);
}
