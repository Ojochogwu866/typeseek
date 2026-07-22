import {
	fontCardLayoutClass,
	fontCardMetaClass,
	fontCardPreviewClass,
	fontCardSimilarityClass,
} from './FontCard';

const skeletonBarClass =
	'inline-block rounded-sm bg-surface-hover animate-skeleton-pulse';

interface SkeletonListProps {
	rows?: number;
	compact?: boolean;
}

export function SkeletonList({ rows = 5, compact = false }: SkeletonListProps) {
	return (
		<div
			className="border-line-faint flex w-full min-w-0 flex-col overflow-hidden rounded-sm border"
			aria-hidden="true"
		>
			{Array.from({ length: rows }).map((_, i) => (
				<div key={i} className={fontCardLayoutClass(compact)}>
					<span
						className={`${skeletonBarClass} h-[1.3rem] w-[35%] ${compact ? fontCardPreviewClass(compact) : ''}`}
					/>
					{compact && (
						<span
							className={`${skeletonBarClass} h-[1.1rem] w-16 ${fontCardSimilarityClass(compact)}`}
						/>
					)}
					<div className={fontCardMetaClass(compact)}>
						<span className={`${skeletonBarClass} h-[1.1rem] w-16`} />
						{!compact && (
							<span className={`${skeletonBarClass} h-[1.1rem] w-16`} />
						)}
					</div>
				</div>
			))}
		</div>
	);
}
