import { useAuthStore } from '@/store/authStore';
import { ApiResponse } from '@shared/types';
// Use a relative path for the API base URL to ensure it works in both development (with Vite proxy) and production on Cloudflare.
const API_BASE_URL = '/api';
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const config: RequestInit = {
    ...options,
    headers,
  };
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    // Handle cases where the response might not be JSON, e.g., 502 Bad Gateway from the dev server
    if (!response.headers.get('content-type')?.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}. Body: ${text}`);
    }
    const json = (await response.json()) as ApiResponse<T>;
    if (!response.ok || !json.success || json.data === undefined) {
      if (response.status === 401) {
        // Handle unauthorized access, e.g., by logging out the user
        useAuthStore.getState().logout();
      }
      throw new Error(json.error || `Request failed with status ${response.status}`);
    }
    return json.data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};