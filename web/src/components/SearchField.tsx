import { useCallback, useEffect, useRef, useState } from 'react';
import type { SearchInput } from '../api/types';
import {
	ArrowRightIcon,
	MagnifyingGlassIcon,
	UploadIcon,
	WarningIcon,
	XIcon,
} from './icons';

interface SearchFieldProps {
	onSearch: (input: SearchInput) => void;
	disabled?: boolean;
}

export function SearchField({ onSearch, disabled }: SearchFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [query, setQuery] = useState('');
	const [isDragging, setIsDragging] = useState(false);
	const [file, setFile] = useState<{
		previewUrl: string;
		name: string;
		raw: File;
	} | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		return () => {
			if (file) URL.revokeObjectURL(file.previewUrl);
		};
	}, [file]);

	const acceptFile = useCallback(
		(candidate: File | undefined) => {
			if (disabled || !candidate) return;

			// Some browsers report an empty MIME type for .heic/.heif (iPhone's default photo
			// format), so fall back to checking the extension when the type is blank.
			const looksLikeImage =
				candidate.type.startsWith('image/') ||
				(candidate.type === '' && /\.(heic|heif)$/i.test(candidate.name));
			if (!looksLikeImage) {
				setError('Please upload an image file.');
				return;
			}

			setError(null);
			setQuery('');
			setFile((current) => {
				if (current) URL.revokeObjectURL(current.previewUrl);
				return {
					previewUrl: URL.createObjectURL(candidate),
					name: candidate.name,
					raw: candidate,
				};
			});
		},
		[disabled]
	);

	const clearFile = () => {
		setFile((current) => {
			if (current) URL.revokeObjectURL(current.previewUrl);
			return null;
		});
		setError(null);
		inputRef.current?.focus();
	};

	const hasFile = file !== null;
	const hasQuery = query.trim().length > 0;

	const submit = () => {
		if (disabled) return;
		if (file) {
			onSearch({ mode: 'image', file: file.raw });
			return;
		}
		const trimmed = query.trim();
		if (!trimmed) return;
		onSearch({ mode: 'text', query: trimmed });
	};

	return (
		<div className="w-full">
			<div
				className={`group bg-surface focus-within:border-primary focus-within:bg-surface-hover flex items-center gap-3 rounded-lg border py-[0.4rem] pr-[0.4rem] pl-4 transition-[border-color,background-color,box-shadow] duration-150 ${
					isDragging ? 'border-secondary bg-surface-hover' : 'border-line'
				} ${disabled ? 'opacity-60' : ''}`}
				onDragOver={(event) => {
					event.preventDefault();
					if (!disabled) setIsDragging(true);
				}}
				onDragLeave={() => setIsDragging(false)}
				onDrop={(event) => {
					event.preventDefault();
					setIsDragging(false);
					acceptFile(event.dataTransfer.files?.[0]);
				}}
			>
				<MagnifyingGlassIcon
					size={18}
					className="text-muted group-focus-within:text-primary shrink-0 transition-colors duration-150"
				/>

				{hasFile ? (
					<div className="flex min-w-0 flex-1 items-center gap-[0.6rem]">
						<span
							className="group/thumb relative flex shrink-0 rounded"
							tabIndex={0}
						>
							<img
								src={file.previewUrl}
								alt=""
								className="border-line-faint h-8 w-8 shrink-0 rounded border object-cover"
							/>
							<img
								src={file.previewUrl}
								alt={`Preview of ${file.name}`}
								className="border-line bg-surface pointer-events-none invisible absolute top-[calc(100%+10px)] left-0 z-20 h-auto w-60 max-w-[60vw] -translate-y-1 rounded-md border object-contain opacity-0 shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-[opacity,transform] duration-150 group-hover/thumb:visible group-hover/thumb:translate-y-0 group-hover/thumb:opacity-100 group-focus-visible/thumb:visible group-focus-visible/thumb:translate-y-0 group-focus-visible/thumb:opacity-100"
							/>
						</span>
						<span className="text-primary min-w-0 overflow-hidden text-[0.95rem] text-ellipsis whitespace-nowrap">
							{file.name}
						</span>
						<button
							type="button"
							className="text-muted hover:text-primary hover:bg-surface-hover ml-auto flex shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-[0.35rem]"
							onClick={clearFile}
							aria-label="Remove image and search by text instead"
						>
							<XIcon size={16} />
						</button>
					</div>
				) : (
					<input
						ref={inputRef}
						type="text"
						className="text-primary placeholder:text-muted min-w-0 flex-1 border-0 bg-transparent py-[0.65rem] font-sans text-[1.05rem] focus:outline-none disabled:cursor-default"
						placeholder='Describe a style — e.g. "bold rounded sans-serif"'
						value={query}
						disabled={disabled}
						onChange={(event) => setQuery(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter') submit();
						}}
					/>
				)}

				<button
					type="button"
					className="bg-primary text-page flex h-[42px] w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-md border-0 transition-opacity duration-150 enabled:hover:opacity-85 disabled:cursor-default disabled:opacity-35"
					onClick={
						hasFile || hasQuery ? submit : () => fileInputRef.current?.click()
					}
					disabled={disabled}
					aria-label={hasFile || hasQuery ? 'Search' : 'Upload an image'}
				>
					{hasFile || hasQuery ? (
						<ArrowRightIcon size={18} />
					) : (
						<UploadIcon size={18} />
					)}
				</button>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*,.heic,.heif"
					hidden
					disabled={disabled}
					onChange={(event) => {
						acceptFile(event.target.files?.[0]);
						event.target.value = '';
					}}
				/>
			</div>

			<p
				className="text-muted mt-1 min-h-[1.4em] px-1 text-[0.85rem] leading-[1.5]"
				aria-live="polite"
			>
				{error ? (
					<span className="text-error inline-flex items-center gap-[0.35rem]">
						<WarningIcon size={14} /> {error}
					</span>
				) : hasFile ? (
					'Image attached — click send to search. Text search is disabled until you remove it.'
				) : (
					''
				)}
			</p>
		</div>
	);
}
