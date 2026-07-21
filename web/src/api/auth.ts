import { API_URL, request } from './http';

export interface AuthUser {
	id: number;
	email: string;
}

interface Credentials {
	email: string;
	password: string;
}

export async function signup(credentials: Credentials): Promise<AuthUser> {
	return request<AuthUser>(`${API_URL}/auth/signup`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(credentials),
	});
}

export async function login(credentials: Credentials): Promise<AuthUser> {
	return request<AuthUser>(`${API_URL}/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(credentials),
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
