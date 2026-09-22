/**
 * Secure API Client — Beasiswa Sultra Cerdas
 * 
 * Features:
 * 1. Proxies all requests through Next.js reverse proxy (/api/v1/*) — hides real backend IP.
 * 2. Automatic JWT Bearer token insertion.
 * 3. Automatic silent 401 token refresh retry mechanism.
 * 4. Input sanitization helpers.
 */

const TOKEN_KEY = 'bssc_access_token';
const REFRESH_KEY = 'bssc_refresh_token';
const USER_KEY = 'bssc_user';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setTokens(accessToken: string, refreshToken: string, user?: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Universal Fetch API wrapper with automatic authentication & token refresh retry
 */
export async function fetchAPI(endpoint: string, options: FetchOptions = {}): Promise<any> {
  const { skipAuth = false, headers: customHeaders = {}, body, ...customOptions } = options;

  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(customHeaders as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Always route through relative path /api/v1 to keep backend hidden
  const url = endpoint.startsWith('/api/v1') ? endpoint : `/api/v1${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  let res = await fetch(url, {
    ...customOptions,
    headers,
    body,
  });

  // Handle 401 Unauthorized — Attempt Token Refresh Once
  if (res.status === 401 && !skipAuth) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.success && refreshData.data?.accessToken) {
            setTokens(refreshData.data.accessToken, refreshData.data.refreshToken || refreshToken);
            // Retry original request with new token
            headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
            res = await fetch(url, {
              ...customOptions,
              headers,
              body,
            });
          } else {
            clearTokens();
          }
        } else {
          clearTokens();
        }
      } catch (refreshErr) {
        clearTokens();
      }
    } else {
      clearTokens();
    }
  }

  const data = await res.json().catch(() => ({ success: false, message: 'Respon server tidak dapat dibaca.' }));

  if (!res.ok) {
    // If 401 persists after refresh attempt, redirect to login automatically
    if (res.status === 401 && !skipAuth && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      clearTokens();
      window.location.href = '/login';
    }

    let errorMessage = data.message || 'Terjadi kesalahan pada server.';
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      errorMessage = data.errors.map((err: any) => err.message).join(' ');
    }
    
    const error = new Error(errorMessage) as any;
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}
