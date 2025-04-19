import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if available
  const { data: { user } } = await supabase.auth.getUser()

  const authRoutes = ['/auth/login', '/auth/register', '/auth/recover'];
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route));
  const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');

  // If user is signed in and trying to access auth routes, redirect to home
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  // If user is not signed in and trying to access protected routes
  if (!user && !isAuthRoute && !isApiAuthRoute) {
    // Allow API requests but respond with 401 for unauthorized API calls
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Redirect to login for page requests
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 