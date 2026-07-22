interface RegionChipProps {
	thumbnail: string;
	label: string;
	isActive: boolean;
	onClick: () => void;
}

export function RegionChip({ thumbnail, label, isActive, onClick }: RegionChipProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={isActive}
			className={`flex flex-col items-center gap-1.5 rounded-md border bg-surface p-1.5 cursor-pointer transition-colors ${
				isActive ? 'border-primary' : 'border-line-faint hover:border-line'
			}`}
		>
			<img
				src={`data:image/jpeg;base64,${thumbnail}`}
				alt=""
				className="h-16 w-16 rounded-sm object-cover"
			/>
			<span className="max-w-16 truncate text-[0.7rem] text-secondary">{label}</span>
		</button>
	);
}
