// middleware.ts or middleware.js
// Place this in the root of your project

import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export function middleware (NextRequest) {
  const { pathname } = request.nextUrl

  // List of auth routes that should not be accessible when logged in
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']

  // Check if trying to access auth routes
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  if (isAuthRoute) {
    // Check for auth token
    const authToken = request.cookies.get('authToken')?.value

    // Also check localStorage (client-side, but we can pass via headers)
    const deviceId = request.cookies.get('deviceId')?.value

    // If user is already logged in, redirect to dashboard
    if (authToken && deviceId) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // For protected routes, ensure user is logged in
  const protectedRoutes = ['/dashboard', '/admin/dashboard']
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    const authToken = request.cookies.get('authToken')?.value

    if (!authToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}
