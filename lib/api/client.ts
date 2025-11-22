/**
 * Centralized API client with Clerk authentication support
 * Supports both client-side and server-side API calls
 */

/**
 * Get the API base URL from environment variable
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

/**
 * Get WebSocket host URL
 * Automatically determines protocol and host based on environment
 */
export function getWebsocketHost(): string {
  const defaultUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://localhost:8000";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || defaultUrl;
  const url = new URL(apiUrl);
  const protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${url.host}/ws/`;
}

/**
 * Options for authenticated fetch requests
 */
export interface FetchWithAuthOptions extends RequestInit {
  /** Optional auth token (for server-side calls or manual token provision) */
  token?: string;
}

/**
 * Centralized fetch wrapper with automatic Clerk authentication
 *
 * Usage:
 * - Client-side: Get token from useAuthenticatedFetch() hook and pass via options.token
 * - Server-side: Get token from auth() and pass via options.token
 *
 * @param endpoint - API endpoint path (e.g., "/user/config/123")
 * @param options - Fetch options with optional token
 * @returns Promise with Response object
 */
export async function fetchWithAuth(
  endpoint: string,
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  const { token, headers = {}, ...fetchOptions } = options;

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  // Add authorization header if token is provided
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    return response;
  } catch (error) {
    console.error(`[API Client] Fetch error for ${endpoint}:`, error);
    throw error;
  }
}
