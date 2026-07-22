import { useTheme } from '../hooks/useTheme';
import { MoonIcon, SunIcon } from './icons';

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			type="button"
			onClick={toggleTheme}
			aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
			className="text-muted hover:text-primary hover:bg-surface-hover flex shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-1.5 cursor-pointer"
		>
			{theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
		</button>
	);
}
