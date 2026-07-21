export function SearchEmptyState() {
	return (
		<div className="text-muted mt-12 flex flex-col items-center gap-4">
			<svg
				viewBox="0 0 120 120"
				width="180"
				height="180"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<circle
					cx="60"
					cy="60"
					r="52"
					stroke="currentColor"
					strokeWidth="3"
					strokeDasharray="2 10"
					strokeLinecap="round"
				/>
				<circle cx="42" cy="54" r="4" fill="currentColor" />
				<circle cx="78" cy="54" r="4" fill="currentColor" />
				<circle cx="39" cy="80" r="3" fill="currentColor" />
				<circle cx="53" cy="80" r="3" fill="currentColor" />
				<circle cx="67" cy="80" r="3" fill="currentColor" />
				<circle cx="81" cy="80" r="3" fill="currentColor" />
			</svg>
			<p className="text-muted max-w-85 text-center font-sans text-[0.95rem] leading-[1.6]">
				You don't have anything to check yet. Get started by describing what
				you're looking for, or uploading an image.
			</p>
		</div>
	);
}
