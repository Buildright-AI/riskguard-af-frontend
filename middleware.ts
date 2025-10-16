import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { checkIsAdmin } from './lib/utils/checkIsAdmin'
import { ADMIN_ONLY_PAGES } from './lib/constants/adminPages'

// Define public routes (sign-in and sign-up pages)
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except public routes
  if (!isPublicRoute(req)) {
    await auth.protect()

    // Check for admin-only page access
    const url = new URL(req.url)
    const page = url.searchParams.get('page')

    if (page && (ADMIN_ONLY_PAGES as readonly string[]).includes(page)) {
      const { orgId } = await auth()

      if (orgId) {
        try {
          const client = await clerkClient()
          const organization = await client.organizations.getOrganization({
            organizationId: orgId,
          })

          const isAdmin = checkIsAdmin(organization)

          if (!isAdmin) {
            // Redirect non-admin users to chat page
            const chatUrl = new URL('/', req.url)
            chatUrl.searchParams.set('page', 'chat')
            return NextResponse.redirect(chatUrl)
          }
        } catch (error) {
          console.error('[Middleware] Error fetching organization:', error)
          // Redirect to chat on error to be safe
          const chatUrl = new URL('/', req.url)
          chatUrl.searchParams.set('page', 'chat')
          return NextResponse.redirect(chatUrl)
        }
      }
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
