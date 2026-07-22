import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
	FontCard,
	fontCardLayoutClass,
	fontCardMetaClass,
	fontCardPreviewClass,
	fontCardSimilarityClass,
} from './FontCard';

describe('FontCard class helpers', () => {
	it('grid layout classes differ between compact and non-compact', () => {
		expect(fontCardLayoutClass(true)).toContain('card-grid');
		expect(fontCardLayoutClass(false)).not.toContain('card-grid');
		expect(fontCardLayoutClass(true)).toContain('border-b');
		expect(fontCardLayoutClass(false)).toContain('border-b');
	});

	it('preview classes use grid-area placement only when compact', () => {
		expect(fontCardPreviewClass(true)).toContain('[grid-area:preview]');
		expect(fontCardPreviewClass(false)).not.toContain('[grid-area:preview]');
	});

	it('meta classes use grid-area placement only when compact', () => {
		expect(fontCardMetaClass(true)).toContain('[grid-area:meta]');
		expect(fontCardMetaClass(false)).not.toContain('[grid-area:meta]');
	});

	it('similarity classes use grid-area placement only when compact', () => {
		expect(fontCardSimilarityClass(true)).toContain('[grid-area:similarity]');
		expect(fontCardSimilarityClass(false)).not.toContain(
			'[grid-area:similarity]'
		);
	});
});

describe('FontCard', () => {
	const font = {
		id: 1,
		name: 'Inter',
		category: 'sans-serif',
		license: 'OFL',
		source_url: 'https://example.com/inter',
		similarity: 0.876,
	};

	it('renders the font name, category, and license', () => {
		render(<FontCard font={font} onSelect={() => {}} />);
		expect(screen.getByText('Inter')).toBeInTheDocument();
		expect(screen.getByText('sans-serif')).toBeInTheDocument();
		expect(screen.getByText('OFL')).toBeInTheDocument();
	});

	it('rounds and formats the similarity as a percentage when present', () => {
		render(<FontCard font={font} onSelect={() => {}} />);
		expect(screen.getByText('88%')).toBeInTheDocument();
	});

	it('omits the similarity badge when similarity is undefined', () => {
		render(
			<FontCard
				font={{ ...font, similarity: undefined }}
				onSelect={() => {}}
			/>
		);
		expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
	});

	it('calls onSelect with the font id when clicked', () => {
		const onSelect = vi.fn();
		render(<FontCard font={font} onSelect={onSelect} />);
		screen.getByRole('button').click();
		expect(onSelect).toHaveBeenCalledWith(1);
	});
});
