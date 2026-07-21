import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

const linkClass =
	'bg-transparent border-0 p-0 text-muted [font:inherit] text-[inherit] cursor-pointer underline hover:text-primary';
const inputClass =
	'w-[130px] px-2 py-[0.3rem] border border-line rounded-md bg-surface text-primary [font:inherit] text-[0.8rem]';

export function AuthWidget() {
	const { user, login, signup, logout } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [mode, setMode] = useState<'login' | 'signup'>('login');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	if (user) {
		return (
			<div className="flex items-center gap-2">
				<span className="text-secondary">{user.email}</span>
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

	const activeMutation = mode === 'login' ? login : signup;

	const submit = (event: FormEvent) => {
		event.preventDefault();
		activeMutation.mutate({ email, password });
	};

	if (!isOpen) {
		return (
			<button
				type="button"
				className={linkClass}
				onClick={() => setIsOpen(true)}
			>
				Sign in
			</button>
		);
	}

	return (
		<form className="flex items-center gap-[0.4rem]" onSubmit={submit}>
			<input
				type="email"
				className={inputClass}
				value={email}
				onChange={(event) => setEmail(event.target.value)}
				placeholder="Email"
				required
			/>
			<input
				type="password"
				className={inputClass}
				value={password}
				onChange={(event) => setPassword(event.target.value)}
				placeholder="Password"
				minLength={8}
				required
			/>
			<button
				type="submit"
				className="border-line bg-surface text-secondary hover:text-primary hover:bg-surface-hover cursor-pointer rounded-md border px-[0.6rem] py-[0.3rem] text-[0.8rem] [font:inherit] disabled:cursor-default disabled:opacity-50"
				disabled={activeMutation.isPending}
			>
				{mode === 'login' ? 'Sign in' : 'Sign up'}
			</button>
			<button
				type="button"
				className={linkClass}
				onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
			>
				{mode === 'login' ? 'Need an account?' : 'Have an account?'}
			</button>
			{activeMutation.isError && (
				<span className="text-error text-[0.75rem]">
					{activeMutation.error.message}
				</span>
			)}
		</form>
	);
}
