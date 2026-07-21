import { useQuery } from '@tanstack/react-query';
import { getFont, getNeighbors } from '../api/client';
import { useGoogleFonts } from '../hooks/useGoogleFonts';
import { DetailPanelSkeleton } from './DetailPanelSkeleton';
import { ExternalLinkIcon, XIcon } from './icons';
import { ResultGrid } from './ResultGrid';
import { StateMessage } from './StateMessage';

export const detailHeadingClass =
	'text-[0.9rem] uppercase tracking-[0.05em] text-muted mt-5 mb-3';

interface DetailPanelProps {
	fontId: number;
	onSelect: (id: number) => void;
	onClose: () => void;
	height: number;
	closing?: boolean;
}

export function DetailPanel({
	fontId,
	onSelect,
	onClose,
	height,
	closing,
}: DetailPanelProps) {
	const fontQuery = useQuery({
		queryKey: ['font', fontId],
		queryFn: () => getFont(fontId),
	});
	const neighborsQuery = useQuery({
		queryKey: ['neighbors', fontId],
		queryFn: () => getNeighbors(fontId),
		enabled: fontQuery.isSuccess,
	});

	const names = fontQuery.data
		? [fontQuery.data.name, ...(neighborsQuery.data?.map((f) => f.name) ?? [])]
		: [];
	const fontsReady = useGoogleFonts(names);

	const neighborsSettled = neighborsQuery.isSuccess || neighborsQuery.isError;
	const isFullyReady = fontQuery.isSuccess && neighborsSettled && fontsReady;

	return (
		<aside
			className={`border-line bg-surface text-primary [&::-webkit-scrollbar-thumb]:bg-line [&::-webkit-scrollbar-thumb:hover]:bg-muted static max-h-[calc(100vh-2rem)] w-full scrollbar-thin overflow-y-auto rounded-sm border p-5 motion-reduce:animate-none md:sticky md:top-4 md:w-80 md:shrink-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-track]:bg-transparent ${closing ? 'animate-panel-out' : 'animate-panel-in'}`}
			style={{ height }}
		>
			<button
				className="text-muted hover:text-primary float-right flex cursor-pointer border-0 bg-transparent p-0"
				onClick={onClose}
				aria-label="Close"
			>
				<XIcon />
			</button>

			{fontQuery.isError && (
				<StateMessage tone="error">Couldn't load this font.</StateMessage>
			)}

			{!fontQuery.isError && !isFullyReady && <DetailPanelSkeleton />}

			{!fontQuery.isError && isFullyReady && (
				<>
					<h2
						className="my-2 text-[2rem]"
						style={{ fontFamily: `"${fontQuery.data!.name}", sans-serif` }}
					>
						{fontQuery.data!.name}
					</h2>
					<div className="mt-2 mb-4 flex gap-[0.35rem]">
						<span className="bg-surface-hover text-secondary rounded-sm px-2 py-[0.15rem] text-[0.7rem]">
							{fontQuery.data!.category}
						</span>
						<span className="bg-license-bg text-license-text rounded-sm px-2 py-[0.15rem] text-[0.7rem]">
							{fontQuery.data!.license}
						</span>
					</div>
					<a
						href={fontQuery.data!.source_url}
						target="_blank"
						rel="noreferrer"
						className="text-secondary hover:text-primary inline-flex items-center gap-[0.3rem] text-[0.85rem]"
					>
						View on Google Fonts
						<ExternalLinkIcon size={12} />
					</a>

					<h3 className={detailHeadingClass}>More like this</h3>
					{neighborsQuery.isError && !neighborsQuery.data && (
						<StateMessage tone="error">
							Couldn't load similar fonts.
						</StateMessage>
					)}
					{neighborsQuery.data?.length === 0 && (
						<StateMessage>No similar fonts found.</StateMessage>
					)}
					{neighborsQuery.data && neighborsQuery.data.length > 0 && (
						<ResultGrid
							results={neighborsQuery.data}
							onSelect={onSelect}
							compact
							scrollable
							height={220}
						/>
					)}
				</>
			)}
		</aside>
	);
}
