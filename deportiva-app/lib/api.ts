const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

type Options = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  token?: string | null;
};

export async function api<T = any>(path: string, opts: Options = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, token } = opts;
  const h: Record<string, string> = { 'Content-Type': 'application/json', ...headers };
  if (token) h['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: h,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}

export function getApiUrl() {
  return API_URL;
}