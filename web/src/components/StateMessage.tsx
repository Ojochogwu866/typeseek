import type { ReactNode } from 'react';
import { WarningIcon } from './icons';

interface StateMessageProps {
	children: ReactNode;
	variant?: 'bordered' | 'inline';
	tone?: 'muted' | 'error';
}

export function StateMessage({
	children,
	variant = 'inline',
	tone = 'muted',
}: StateMessageProps) {
	const classes = [
		'flex items-center justify-center gap-2 text-muted text-[0.9rem] text-center',
		variant === 'bordered'
			? 'flex-1 min-h-30 p-8 border border-line-faint rounded-sm'
			: 'min-h-15 py-4',
		tone === 'error' ? 'text-error' : '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={classes}>
			{tone === 'error' && <WarningIcon />}
			{children}
		</div>
	);
}
