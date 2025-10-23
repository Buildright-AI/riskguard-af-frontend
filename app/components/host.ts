"use client";

/**
 * Get the API base URL from environment variable
 * @deprecated Use getApiBaseUrl() from @/lib/api/client instead
 */
export const host =
  process.env.NEXT_PUBLIC_IS_STATIC !== "true"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    : "";

export const public_path =
  process.env.NEXT_PUBLIC_IS_STATIC !== "true" ? "/" : "/static/";

/**
 * Get WebSocket host URL
 * Automatically determines protocol and host based on environment
 */
export const getWebsocketHost = () => {
  // Static build: use current browser location
  if (process.env.NEXT_PUBLIC_IS_STATIC === "true") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws/`;
  }

  // Development or production: use configured API URL
  const defaultUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://localhost:8000";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || defaultUrl;
  const url = new URL(apiUrl);
  const protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${url.host}/ws/`;
};
