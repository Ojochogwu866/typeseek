import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchField } from './SearchField';

beforeEach(() => {
	URL.createObjectURL = vi.fn(() => 'blob:mock');
	URL.revokeObjectURL = vi.fn();
});

function getFileInput() {
	return document.querySelector('input[type="file"]') as HTMLInputElement;
}

describe('SearchField', () => {
	it('shows the upload button and no query text by default', () => {
		render(<SearchField onSearch={() => {}} />);
		expect(
			screen.getByRole('button', { name: 'Upload an image' })
		).toBeInTheDocument();
	});

	it('swaps to the search button once text is typed', () => {
		render(<SearchField onSearch={() => {}} />);
		fireEvent.change(screen.getByPlaceholderText(/describe a style/i), {
			target: { value: 'bold rounded sans-serif' },
		});
		expect(
			screen.getByRole('button', { name: 'Search' })
		).toBeInTheDocument();
	});

	it('accepts a .heic file with an empty MIME type via the extension fallback', () => {
		render(<SearchField onSearch={() => {}} />);
		const file = new File(['data'], 'photo.heic', { type: '' });

		fireEvent.change(getFileInput(), { target: { files: [file] } });

		expect(screen.getByText('photo.heic')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
	});

	it('rejects a non-image file and shows an error message', () => {
		render(<SearchField onSearch={() => {}} />);
		const file = new File(['data'], 'notes.txt', { type: 'text/plain' });

		fireEvent.change(getFileInput(), { target: { files: [file] } });

		expect(screen.getByText('Please upload an image file.')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Upload an image' })
		).toBeInTheDocument();
	});

	it('calls onSearch with the image mode when submitting a file', () => {
		const onSearch = vi.fn();
		render(<SearchField onSearch={onSearch} />);
		const file = new File(['data'], 'photo.png', { type: 'image/png' });

		fireEvent.change(getFileInput(), { target: { files: [file] } });
		fireEvent.click(screen.getByRole('button', { name: 'Search' }));

		expect(onSearch).toHaveBeenCalledWith({ mode: 'image', file });
	});

	it('calls onSearch with the text mode when submitting typed text', () => {
		const onSearch = vi.fn();
		render(<SearchField onSearch={onSearch} />);

		fireEvent.change(screen.getByPlaceholderText(/describe a style/i), {
			target: { value: '  a bold sans  ' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Search' }));

		expect(onSearch).toHaveBeenCalledWith({ mode: 'text', query: 'a bold sans' });
	});

	it('clearing an attached file re-enables text search', () => {
		render(<SearchField onSearch={() => {}} />);
		const file = new File(['data'], 'photo.png', { type: 'image/png' });
		fireEvent.change(getFileInput(), { target: { files: [file] } });

		fireEvent.click(
			screen.getByRole('button', { name: 'Remove image and search by text instead' })
		);

		expect(
			screen.getByPlaceholderText(/describe a style/i)
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Upload an image' })
		).toBeInTheDocument();
	});
});
