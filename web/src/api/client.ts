import { API_URL, request } from './http';
import type { FontResult } from './types';

export async function searchByImage(
	file: File,
	license?: string
): Promise<FontResult[]> {
	const form = new FormData();
	form.append('image', file);
	if (license) form.append('license', license);
	return request<FontResult[]>(`${API_URL}/search`, {
		method: 'POST',
		body: form,
	});
}

export async function searchByText(
	query: string,
	license?: string
): Promise<FontResult[]> {
	return request<FontResult[]>(`${API_URL}/search/text`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query, license }),
	});
}

export async function getFont(id: number): Promise<FontResult> {
	return request<FontResult>(`${API_URL}/fonts/${id}`);
}

export async function getNeighbors(id: number): Promise<FontResult[]> {
	return request<FontResult[]>(`${API_URL}/fonts/${id}/neighbors`);
}
