const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api').replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 10_000;
const GET_RETRY_DELAY_MS = 250;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<T | null> {
  const maxAttempts = method === 'GET' ? 2 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        credentials: 'include',
        headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (response.status === 204) return null;
      if (response.status === 401) return null;

      if (!response.ok) {
        const canRetry = method === 'GET' && attempt === 0 && (
          response.status === 408 || response.status === 429 || response.status >= 500
        );
        if (canRetry) {
          await new Promise((resolve) => setTimeout(resolve, GET_RETRY_DELAY_MS));
          continue;
        }
        console.warn(`API unavailable for ${path} (${method}): HTTP ${response.status}: ${await response.text()}`);
        return null;
      }

      const responseText = await response.text();
      return responseText ? (JSON.parse(responseText) as T) : null;
    } catch (error) {
      if (method === 'GET' && attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, GET_RETRY_DELAY_MS));
        continue;
      }
      console.warn(`API unavailable for ${path} (${method}):`, error);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${API_BASE_URL}/uploads`, {
        method: 'POST',
        body,
        credentials: 'include',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      const result = (await response.json()) as { url: string };
      return `${API_BASE_URL.replace(/\/api$/, '')}${result.url}`;
    } catch (error) {
      console.warn('Image upload failed:', error);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  },
};
