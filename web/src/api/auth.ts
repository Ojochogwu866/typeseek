import { API_URL, request } from './http';

export interface AuthUser {
	id: number;
	email: string;
	name: string;
}

export async function googleAuth(credential: string): Promise<AuthUser> {
	return request<AuthUser>(`${API_URL}/auth/google`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ credential }),
	});
}

export async function logout(): Promise<void> {
	await request<void>(`${API_URL}/auth/logout`, { method: 'POST' });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
	try {
		return await request<AuthUser>(`${API_URL}/auth/me`);
	} catch {
		return null;
	}
}
