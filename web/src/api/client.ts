import type { FontResult } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8080";

async function parseOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }
  return parseOrThrow<T>(response);
}

export async function searchByImage(file: File): Promise<FontResult[]> {
  const form = new FormData();
  form.append("image", file);
  return request<FontResult[]>(`${API_URL}/search`, { method: "POST", body: form });
}

export async function getFont(id: number): Promise<FontResult> {
  return request<FontResult>(`${API_URL}/fonts/${id}`);
}

export async function getNeighbors(id: number): Promise<FontResult[]> {
  return request<FontResult[]>(`${API_URL}/fonts/${id}/neighbors`);
}
