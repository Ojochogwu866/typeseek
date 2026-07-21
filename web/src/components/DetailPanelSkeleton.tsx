import { detailHeadingClass } from './DetailPanel';
import { SkeletonList } from './SkeletonList';

const skeletonBarClass =
	'inline-block rounded-sm bg-surface-hover animate-skeleton-pulse';

export function DetailPanelSkeleton() {
	return (
		<div aria-hidden="true">
			<span className={`${skeletonBarClass} my-2 block h-10 w-[60%]`} />
			<div className="mt-2 mb-4 flex gap-[0.35rem]">
				<span className={`${skeletonBarClass} h-[1.1rem] w-16`} />
				<span className={`${skeletonBarClass} h-[1.1rem] w-16`} />
			</div>
			<span className={`${skeletonBarClass} mt-1 block h-[0.9rem] w-[40%]`} />

			<h3 className={detailHeadingClass}>More like this</h3>
			<SkeletonList rows={4} compact />
		</div>
	);
}
