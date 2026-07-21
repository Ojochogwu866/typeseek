export interface FontResult {
	id: number;
	name: string;
	category: string;
	license: string;
	source_url: string;
	similarity?: number;
}

export type SearchInput =
	{ mode: 'image'; file: File } | { mode: 'text'; query: string };
