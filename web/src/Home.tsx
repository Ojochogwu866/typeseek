import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from './components/icons';

function Home() {
	const navigate = useNavigate();

	return (
		<div className="bg-page flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
			<h1 className="font-display text-primary m-0 text-[8rem] font-black tracking-[-0.02em]">
				type<span className="text-muted font-normal">/</span>seek
			</h1>

			<div className="flex max-w-155 flex-col gap-5">
				<p className="text-secondary m-0 text-center font-sans text-[1.1rem] leading-[1.7]">
					You're walking past a shopfront and a hand-painted sign stops you
					mid-step. Or it's a flyer stapled to a lamppost, curling at the edges,
					the lettering doing something you've never quite seen before. You take
					a photo before you've even decided why.
				</p>
				<p className="text-secondary m-0 text-center font-sans text-[1.1rem] leading-[1.7]">
					Later, you go looking for the name. You try describing it — bold, a
					little rounded, condensed maybe — but the words come out wrong, and
					every search leads somewhere close but not quite it. You scroll past
					hundreds of typefaces that all start to blur together. The one you
					actually saw is still out there, nameless.
				</p>
				<p className="text-secondary m-0 text-center font-sans text-[1.1rem] leading-[1.7]">
					That's the gap typeseek closes. Show it a photo, or just describe what
					you remember, and it finds the font — not something similar, not a
					guess, but a real match pulled from thousands of typefaces by how they
					actually look. No more scrolling. No more almost.
				</p>
			</div>

			<button
				type="button"
				className="border-primary bg-primary text-page flex min-w-85 cursor-pointer items-center justify-center gap-[0.65rem] rounded-lg border px-8 py-4 font-sans text-[1.05rem] font-semibold transition-[opacity,gap] duration-150 hover:gap-[0.9rem] hover:opacity-85"
				onClick={() => navigate('/search')}
			>
				<span>Get started</span>
				<ArrowRightIcon size={18} className="shrink-0" />
			</button>
		</div>
	);
}

export default Home;
