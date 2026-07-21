import { GithubLogoIcon } from './icons';

export function Footer() {
	return (
		<footer className="text-muted mt-auto flex w-full max-w-275 items-center justify-between px-1 pt-12 pb-6 text-[0.8rem]">
			<span>© {new Date().getFullYear()} typeseek</span>
			<a
				href="https://github.com/Ojochogwu866/typeseek"
				target="_blank"
				rel="noreferrer"
				className="hover:text-primary flex items-center gap-1.5"
			>
				<GithubLogoIcon size={16} />
				GitHub
			</a>
		</footer>
	);
}
