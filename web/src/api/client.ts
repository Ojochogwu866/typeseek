import type { FontResult } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8080";

async function parseOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function searchByImage(file: File): Promise<FontResult[]> {
  const form = new FormData();
  form.append("image", file);
  const response = await fetch(`${API_URL}/search`, { method: "POST", body: form });
  return parseOrThrow<FontResult[]>(response);
}

export async function getFont(id: number): Promise<FontResult> {
  const response = await fetch(`${API_URL}/fonts/${id}`);
  return parseOrThrow<FontResult>(response);
}

export async function getNeighbors(id: number): Promise<FontResult[]> {
  const response = await fetch(`${API_URL}/fonts/${id}/neighbors`);
  return parseOrThrow<FontResult[]>(response);
}
