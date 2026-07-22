import { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

const linkClass =
	'bg-transparent border-0 p-0 text-muted [font:inherit] text-[inherit] cursor-pointer underline hover:text-primary';

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
			<div className="flex items-center gap-2">
				<span className="text-secondary">{user.name || user.email}</span>
				<button
					type="button"
					className={linkClass}
					onClick={() => logout.mutate()}
				>
					Log out
				</button>
			</div>
		);
	}

	return <div ref={buttonRef} />;
}
