import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Ensure we don't protect the homepage if we don't want to, or protect everything.
// Typically you might want to protect specific routes. For now we will allow the homepage 
// and protect specific pages if you had them, or vice versa.
const isPublicRoute = createRouteMatcher([
  '/',
  '/about(.*)',
  '/pricing(.*)',
  '/contact(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/forgot-password(.*)',
  '/sitemap.xml',
  '/robots.txt',
  '/api/auth(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
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
