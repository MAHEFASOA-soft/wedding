const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api').replace(/\/+$/, '');

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const responseText = await response.text();
    return responseText ? (JSON.parse(responseText) as T) : null;
  } catch (error) {
    console.warn(`API unavailable for ${path} (${method}):`, error);
    return null;
  }
}

export const api = {
  get: <T,>(path: string) => request<T>(path, 'GET'),
  post: <T,>(path: string, body: unknown) => request<T>(path, 'POST', body),
  put: <T,>(path: string, body: unknown) => request<T>(path, 'PUT', body),
  patch: <T,>(path: string, body: unknown) => request<T>(path, 'PATCH', body),
  del: <T,>(path: string) => request<T>(path, 'DELETE'),
  upload: async (file: File): Promise<string | null> => {
    const body = new FormData();
    body.append('file', file);
    try {
      const response = await fetch(`${API_BASE_URL}/uploads`, { method: 'POST', body });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      const result = (await response.json()) as { url: string };
      return `${API_BASE_URL.replace(/\/api$/, '')}${result.url}`;
    } catch (error) {
      console.warn('Image upload failed:', error);
      return null;
    }
  },
};
