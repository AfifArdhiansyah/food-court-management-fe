import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_KEYS } from '@/lib/cookies'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/monitor',
]

// Routes that should redirect to dashboard if already authenticated
const authRoutes = [
  '/login',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(COOKIE_KEYS.TOKEN)?.value
  const isAuthenticated = !!token

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Allow manual navigation to login page (for logout/session issues)
  // Only redirect to dashboard if coming from a redirect parameter
  if (isAuthRoute && isAuthenticated) {
    const redirectParam = request.nextUrl.searchParams.get('redirect')

    // If there's no redirect parameter, allow access to login (manual navigation)
    if (!redirectParam) {
      return NextResponse.next()
    }

    // If there's a redirect parameter, redirect to dashboard
    const userData = request.cookies.get(COOKIE_KEYS.USER)?.value

    if (userData) {
      try {
        const user = JSON.parse(userData)
        const dashboardUrl = user.role === 'cashier'
          ? '/dashboard/cashier'
          : '/dashboard/kios'
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
      } catch {
        // If user data is corrupted, redirect to default dashboard
        return NextResponse.redirect(new URL('/dashboard/cashier', request.url))
      }
    }

    // Default redirect if no user data
    return NextResponse.redirect(new URL('/dashboard/cashier', request.url))
  }

  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
