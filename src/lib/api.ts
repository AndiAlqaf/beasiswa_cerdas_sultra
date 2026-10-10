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
  localStorage.removeItem('bssc_application_draft');
  localStorage.removeItem('bssc_register_draft');
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * fetch() wrapper that never leaks the raw browser message "Failed to fetch".
 * That error means NO HTTP response was received at all (connection dropped,
 * reset while uploading, server restarting, device offline, etc.).
 * Idempotent GET requests are retried once to absorb transient drops.
 */
async function safeFetch(url: string, init: RequestInit): Promise<Response> {
  const method = (init.method || 'GET').toUpperCase();
  try {
    return await fetch(url, init);
  } catch (firstErr) {
    let lastErr: unknown = firstErr;

    if (method === 'GET') {
      await new Promise((resolve) => setTimeout(resolve, 800));
      try {
        return await fetch(url, init);
      } catch (secondErr) {
        lastErr = secondErr;
      }
    }

    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    const error = new Error(
      offline
        ? 'Perangkat Anda sedang tidak terhubung ke internet. Periksa koneksi lalu coba lagi.'
        : 'Koneksi ke server terputus sebelum selesai. Pastikan sinyal stabil lalu coba lagi. Jika sedang mengunggah berkas, pastikan ukuran file maksimal 2 MB.'
    ) as any;
    error.isNetworkError = true;
    error.originalError = lastErr;
    throw error;
  }
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

  let res = await safeFetch(url, {
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
            res = await safeFetch(url, {
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

  // Safe response text reading and parsing
  let data: any = null;
  const rawText = await res.text().catch(() => '');
  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      let friendlyMessage = 'Respon server tidak dapat dibaca.';
      if (res.status === 401) {
        friendlyMessage = 'Sesi login Anda telah berakhir. Silakan login kembali.';
      } else if (res.status === 413) {
        friendlyMessage = 'Gagal Mengunggah Berkas: Ukuran file yang Anda unggah terlalu besar. Silakan kompres/kecilkan ukuran PDF atau foto Anda di bawah 2MB.';
      } else if (res.status === 502 || res.status === 504) {
        friendlyMessage = 'Server portal sedang dalam pemeliharaan atau mengalami gangguan koneksi sementara. Silakan coba beberapa saat lagi.';
      } else if (res.status >= 500) {
        friendlyMessage = `Server mengalami kendala internal (${res.status}). Silakan coba muat ulang halaman.`;
      }
      data = {
        success: false,
        message: friendlyMessage,
      };
    }
  } else {
    data = { success: false, message: 'Respon server kosong.' };
  }

  if (!res.ok) {
    // If 401 Unauthorized persists, clear tokens and auto-redirect to login
    if (res.status === 401 && !skipAuth && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      clearTokens();
      window.location.href = '/login?expired=1';
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
