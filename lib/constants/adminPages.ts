/**
 * List of pages that require admin access.
 * Single source of truth used by both middleware and client-side routing.
 */
export const ADMIN_ONLY_PAGES = [
  'data',
  'collection',
  'settings',
  'eval',
  'feedback',
  'elysia',
  'display',
] as const

export type AdminPage = typeof ADMIN_ONLY_PAGES[number]

/**
 * All valid pages in the application.
 * Single source of truth for route validation.
 */
export const VALID_PAGES = ['chat', ...ADMIN_ONLY_PAGES] as const

export type ValidPage = typeof VALID_PAGES[number]
