import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchByImage, searchByText } from './api/client';
import type { RegionResult, SearchInput } from './api/types';
import { AuthWidget } from './components/AuthWidget';
import { DetailPanel } from './components/DetailPanel';
import { Footer } from './components/Footer';
import { LicenseFilter } from './components/LicenseFilter';
import { RegionChip } from './components/RegionChip';
import { ResultGrid } from './components/ResultGrid';
import { SearchEmptyState } from './components/SearchEmptyState';
import { SearchField } from './components/SearchField';
import { SkeletonList } from './components/SkeletonList';
import { StateMessage } from './components/StateMessage';
import { ThemeToggle } from './components/ThemeToggle';
import { useDelayedFlag } from './hooks/useDelayedFlag';
import { useDelayedUnmount } from './hooks/useDelayedUnmount';
import { useGoogleFonts } from './hooks/useGoogleFonts';

const RESULTS_HEIGHT = 460;
const SLOW_REQUEST_HINT_DELAY_MS = 4000;
// Must match .animate-panel-out's duration in index.css.
const DETAIL_PANEL_EXIT_MS = 300;

// Normalizes both modes to RegionResult[]; text search is always a single group.
function runSearch(input: SearchInput, license: string): Promise<RegionResult[]> {
	if (input.mode === 'image') {
		return searchByImage(input.file, license);
	}
	return searchByText(input.query, license).then((results) => [{ results }]);
}

function Search() {
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
	const [license, setLicense] = useState('');
	const [lastInput, setLastInput] = useState<SearchInput | null>(null);
	const lastSelectedIdRef = useRef<number | null>(null);
	if (selectedId !== null) lastSelectedIdRef.current = selectedId;

	const isDetailOpen = selectedId !== null;
	const shouldRenderDetail = useDelayedUnmount(
		isDetailOpen,
		DETAIL_PANEL_EXIT_MS
	);

	const searchMutation = useMutation({
		mutationFn: (input: SearchInput) => runSearch(input, license),
	});
	const isTakingAWhile = useDelayedFlag(
		searchMutation.isPending,
		SLOW_REQUEST_HINT_DELAY_MS
	);

	const regions = searchMutation.data ?? [];
	const primary = regions[0];
	const secondary = regions
		.map((region, index) => ({ region, index }))
		.slice(1)
		.filter(({ region }) => region.results.length > 0);
	const totalResults = regions.reduce((sum, region) => sum + region.results.length, 0);
	const fontsReady = useGoogleFonts(regions.flatMap((region) => region.results.map((font) => font.name)));
	const showSkeleton =
		searchMutation.isPending ||
		(searchMutation.isSuccess && totalResults > 0 && !fontsReady);

	const runNewSearch = (input: SearchInput) => {
		setSelectedId(null);
		setExpandedIndex(null);
		setLastInput(input);
		searchMutation.mutate(input);
	};

	useEffect(() => {
		if (!lastInput) return;
		setSelectedId(null);
		setExpandedIndex(null);
		searchMutation.mutate(lastInput);
	}, [license]);

	return (
		<div className="bg-page animate-page-in-right relative flex min-h-screen flex-col items-center px-4 py-8 motion-reduce:animate-none sm:px-6 sm:py-12">
			<div className="mb-4 flex w-full items-center justify-end gap-3 text-[0.8rem] sm:absolute sm:top-5 sm:right-6 sm:mb-0 sm:w-auto">
				<ThemeToggle />
				<AuthWidget />
			</div>

			<h1 className="font-display text-primary m-0 text-[2rem] font-black tracking-[-0.02em] sm:text-[2.5rem]">
				<Link to="/" className="cursor-default no-underline select-none">
					type<span className="text-muted font-normal">/</span>seek
				</Link>
			</h1>

			<p className="text-secondary mt-4 max-w-135 text-center font-sans text-[1rem] leading-normal sm:mt-5 sm:text-[1.1rem] sm:leading-[1.6]">
				Search by visual style, not conversation — describe letterforms, weight,
				or mood, like "bold rounded sans-serif," or drop in an image instead.
			</p>

			<div className="mt-6 w-full max-w-155 sm:mt-8">
				<SearchField
					onSearch={runNewSearch}
					disabled={searchMutation.isPending}
				/>
			</div>

			<div className="mt-4 w-full max-w-155">
				<LicenseFilter
					value={license}
					onChange={setLicense}
					disabled={searchMutation.isPending}
				/>
			</div>

			{searchMutation.isIdle && <SearchEmptyState />}

			{!searchMutation.isIdle && (
				<div className="mt-8 flex w-full max-w-275 flex-col items-start gap-4 sm:mt-10 md:flex-row md:gap-6">
					<div className="flex w-full min-w-0 flex-1 flex-col gap-8">
						{showSkeleton && (
							<>
								<SkeletonList />
								{isTakingAWhile && (
									<p className="text-muted mt-2.5 text-center text-[0.8rem]">
										Still working — the first search can take longer while the
										model warms up.
									</p>
								)}
							</>
						)}
						{searchMutation.isError && (
							<StateMessage variant="bordered" tone="error">
								{(searchMutation.error as Error).message}
							</StateMessage>
						)}
						{!showSkeleton && searchMutation.isSuccess && totalResults === 0 && (
							<StateMessage variant="bordered">
								No matching fonts found. Try a different image or description.
							</StateMessage>
						)}
						{!showSkeleton && searchMutation.isSuccess && totalResults > 0 && (
							<>
								{primary && primary.results.length > 0 && (
									<ResultGrid
										results={primary.results}
										onSelect={setSelectedId}
										scrollable
										height={RESULTS_HEIGHT}
									/>
								)}

								{secondary.length > 0 && (
									<div className="flex w-full min-w-0 flex-col gap-3">
										<p className="text-muted text-[0.8rem] font-sans">
											Other lettering styles found in this photo
										</p>
										<div className="flex flex-wrap gap-2">
											{secondary.map(({ region, index }) => (
												<RegionChip
													key={index}
													thumbnail={region.thumbnail ?? ''}
													label={region.results[0]?.name ?? 'Unknown'}
													isActive={expandedIndex === index}
													onClick={() =>
														setExpandedIndex(expandedIndex === index ? null : index)
													}
												/>
											))}
										</div>
										{expandedIndex !== null && regions[expandedIndex] && (
											<ResultGrid
												results={regions[expandedIndex].results}
												onSelect={setSelectedId}
												scrollable
												height={RESULTS_HEIGHT}
											/>
										)}
									</div>
								)}
							</>
						)}
					</div>

					{shouldRenderDetail && lastSelectedIdRef.current !== null && (
						<DetailPanel
							fontId={lastSelectedIdRef.current}
							onSelect={setSelectedId}
							onClose={() => setSelectedId(null)}
							height={RESULTS_HEIGHT}
							closing={!isDetailOpen}
						/>
					)}
				</div>
			)}

			<Footer />
		</div>
	);
}

export default Search;
