import { ReadonlyURLSearchParams } from 'next/navigation'

/**
 * Extract all current query parameters into an object.
 */
export function getCurrentParams(
  searchParams: ReadonlyURLSearchParams,
  exclude?: string[]
): Record<string, string> {
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    if (!exclude || !exclude.includes(key)) {
      params[key] = value
    }
  })
  return params
}

/**
 * Navigate to a page by updating browser history.
 */
export function navigateToPage(
  page: string,
  params: Record<string, string> = {},
  replace: boolean = true
): void {
  const url = `/?${new URLSearchParams({ page, ...params }).toString()}`
  if (replace) {
    window.history.replaceState(null, '', url)
  } else {
    window.history.pushState(null, '', url)
  }
}
