import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { UserCircleIcon } from './icons';

const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

function SignedInMenu({ name, onLogout }: { name: string; onLogout: () => void }) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen]);

	return (
		<div ref={containerRef} className="relative">
			<button
				type="button"
				onClick={() => setIsOpen((open) => !open)}
				aria-label="Account menu"
				aria-expanded={isOpen}
				className="text-muted hover:text-primary flex shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0"
			>
				<UserCircleIcon size={26} />
			</button>

			{isOpen && (
				<div className="border-line bg-surface absolute top-full right-0 mt-2 w-44 rounded-md border py-1 shadow-lg">
					<div className="text-primary border-line-faint truncate border-b px-3 py-2 text-[0.85rem] font-semibold">
						{name}
					</div>
					<button
						type="button"
						className="text-muted flex w-full cursor-default items-center bg-transparent px-3 py-2 text-left text-[0.85rem]"
						disabled
					>
						Profile
					</button>
					<button
						type="button"
						onClick={onLogout}
						className="text-secondary hover:text-primary hover:bg-surface-hover flex w-full cursor-pointer items-center bg-transparent px-3 py-2 text-left text-[0.85rem]"
					>
						Log out
					</button>
				</div>
			)}
		</div>
	);
}

export function AuthWidget() {
	const { user, googleAuth, logout } = useAuth();
	const { theme } = useTheme();
	const buttonRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (user) return;

		const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
		if (!clientId) {
			console.warn(
				'VITE_GOOGLE_CLIENT_ID is not set — Google sign-in button will not render.'
			);
			return;
		}

		const renderButton = () => {
			if (!buttonRef.current || !window.google) return;
			window.google.accounts.id.initialize({
				client_id: clientId,
				callback: (response) => googleAuth.mutate(response.credential),
			});
			buttonRef.current.innerHTML = '';
			window.google.accounts.id.renderButton(buttonRef.current, {
				theme: theme === 'dark' ? 'filled_black' : 'outline',
				size: 'medium',
				text: 'signin_with',
			});
		};

		if (window.google) {
			renderButton();
			return;
		}

		const script = document.querySelector<HTMLScriptElement>(
			`script[src="${GSI_SCRIPT_SRC}"]`
		);
		script?.addEventListener('load', renderButton);
		return () => script?.removeEventListener('load', renderButton);
	}, [user, googleAuth, theme]);

	if (user) {
		return (
			<SignedInMenu key="signed-in" name={user.name || user.email} onLogout={() => logout.mutate()} />
		);
	}

	return <div key="signed-out" ref={buttonRef} />;
}
