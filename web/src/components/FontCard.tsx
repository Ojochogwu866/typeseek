import type { FontResult } from '../api/types';

export function fontCardLayoutClass(compact?: boolean) {
	return compact
		? 'card-grid w-full items-center gap-x-2 gap-y-[0.35rem] px-[0.85rem] py-[0.6rem] border-0 border-b border-line-faint last:border-b-0 bg-surface text-left [font:inherit] text-primary transition-colors duration-150'
		: 'flex flex-row items-center gap-2 sm:gap-4 w-full px-3 sm:px-4 py-3 border-0 border-b border-line-faint last:border-b-0 bg-surface text-left [font:inherit] text-primary transition-colors duration-150';
}

export function fontCardPreviewClass(compact?: boolean) {
	return compact
		? '[grid-area:preview] min-w-0 whitespace-nowrap overflow-hidden text-ellipsis text-primary text-xl'
		: 'flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis text-primary text-xl sm:text-2xl leading-[1.2]';
}

export function fontCardMetaClass(compact?: boolean) {
	return compact
		? '[grid-area:meta] flex shrink-0 flex-wrap gap-[0.35rem]'
		: 'flex shrink-0 gap-[0.35rem]';
}

export function fontCardSimilarityClass(compact?: boolean) {
	return compact
		? '[grid-area:similarity] justify-self-end shrink-0'
		: 'shrink-0';
}

export const badgeClass =
	'text-[0.7rem] px-2 py-[0.15rem] rounded-sm bg-surface-hover text-secondary';
export const badgeLicenseClass =
	'text-[0.7rem] px-2 py-[0.15rem] rounded-sm bg-license-bg text-license-text';
export const badgeSimilarityClass =
	'text-[0.7rem] px-2 py-[0.15rem] rounded-sm bg-similarity-bg text-similarity-text';

interface FontCardProps {
	font: FontResult;
	onSelect: (id: number) => void;
	compact?: boolean;
}

export function FontCard({ font, onSelect, compact }: FontCardProps) {
	return (
		<button
			className={`${fontCardLayoutClass(compact)} hover:bg-surface-hover cursor-pointer`}
			onClick={() => onSelect(font.id)}
		>
			<span
				className={fontCardPreviewClass(compact)}
				style={{ fontFamily: `"${font.name}", sans-serif` }}
			>
				{font.name}
			</span>
			<div className={fontCardMetaClass(compact)}>
				<span className={badgeClass}>{font.category}</span>
				<span className={badgeLicenseClass}>{font.license}</span>
			</div>
			{font.similarity !== undefined && (
				<span
					className={`${badgeSimilarityClass} ${fontCardSimilarityClass(compact)}`}
				>
					{Math.round(font.similarity * 100)}%
				</span>
			)}
		</button>
	);
}
