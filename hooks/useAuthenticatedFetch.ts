"use client";

import { useAuth, useUser } from "@clerk/nextjs";

/**
 * Hook for accessing Clerk authentication in client components
 *
 * Provides the authentication token and user identity needed for API calls
 *
 * Usage:
 * ```tsx
 * const { getAuthToken, userId, isSignedIn } = useAuthenticatedFetch();
 *
 * // Get token for API call
 * const token = await getAuthToken();
 * const response = await fetchWithAuth("/endpoint", { token });
 *
 * // Access user ID
 * console.log(userId); // Clerk user ID
 *
 * // Check if signed in
 * if (isSignedIn) { ... }
 * ```
 */
export function useAuthenticatedFetch() {
  const { getToken } = useAuth();
  const { user, isSignedIn } = useUser();

  return {
    // Token access
    getAuthToken: getToken,
    // User identity
    userId: user?.id || null,
    isSignedIn,
  };
}
