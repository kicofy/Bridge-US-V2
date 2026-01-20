import { useAuthStore } from '../store/auth';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.bridge-us.org/api';
export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const { refreshToken, setTokens, clear } = useAuthStore.getState();
    if (!refreshToken) {
      clear();
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        clear();
        return false;
      }

      const data = (await response.json()) as {
        access_token: string;
        refresh_token: string;
      };
      setTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      clear();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean; retryOnUnauthorized?: boolean } = {}
): Promise<T> {
  const { auth = true, retryOnUnauthorized = true, ...fetchOptions } = options;
  const { accessToken } = useAuthStore.getState();
  const headers = new Headers(fetchOptions.headers || {});

  if (auth && accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (
    fetchOptions.body &&
    !(headers.has('Content-Type') || headers.has('content-type'))
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 && auth && retryOnUnauthorized) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, retryOnUnauthorized: false });
    }
  }

  if (!response.ok) {
    let message = response.statusText;
    let code: string | undefined;
    try {
      const payload = await response.json();
      message = payload.message || payload.detail || message;
      code = payload.code;
    } catch {
      // Ignore JSON parse errors for non-JSON responses
    }
    throw new ApiError(message, response.status, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

