/**
 * Centralized API client with Clerk authentication support
 * Supports both client-side and server-side API calls
 */

/**
 * Get the API base URL from environment variable
 * Falls back to empty string for static builds
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_IS_STATIC === "true") {
    return "";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
