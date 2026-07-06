import { supabase } from '@/integrations/supabase/client';

// Points to the Express server. Override with VITE_API_URL in .env.local
const API_BASE = (
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:4000'
).replace(/\/$/, '');

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? `API ${method} ${path} → ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)                => apiRequest<T>('GET', path),
  post:   <T>(path: string, body: unknown) => apiRequest<T>('POST', path, body),
  put:    <T>(path: string, body: unknown) => apiRequest<T>('PUT', path, body),
  patch:  <T>(path: string, body: unknown) => apiRequest<T>('PATCH', path, body),
  delete: <T>(path: string)               => apiRequest<T>('DELETE', path),
};
