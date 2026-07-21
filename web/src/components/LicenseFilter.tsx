const LICENSE_OPTIONS = [
	{ value: '', label: 'Any' },
	{ value: 'commercial-ok', label: 'Commercial OK' },
	{ value: 'personal-only', label: 'Personal only' },
	{ value: 'unclear', label: 'Unclear' },
];

interface LicenseFilterProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

export function LicenseFilter({ value, onChange, disabled }: LicenseFilterProps) {
	return (
		<div className="flex flex-wrap items-center justify-center gap-2" role="radiogroup" aria-label="Filter by license">
			{LICENSE_OPTIONS.map((option) => {
				const isActive = value === option.value;
				return (
					<button
						key={option.value}
						type="button"
						role="radio"
						aria-checked={isActive}
						disabled={disabled}
						onClick={() => onChange(option.value)}
						className={`px-3 py-1.5 rounded-full border text-[0.8rem] font-sans cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default ${
							isActive
								? 'bg-primary text-page border-primary'
								: 'bg-surface text-secondary border-line hover:border-secondary'
						}`}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
