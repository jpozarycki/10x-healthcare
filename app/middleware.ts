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

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');
  const isPublicAsset = request.nextUrl.pathname.match(
    /\.(ico|png|jpg|jpeg|svg|css|js|json)$/
  );

  // If user is signed in and trying to access auth routes, redirect to dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is not signed in and not accessing auth routes or public assets, redirect to login
  if (!user && !isAuthRoute && !isApiAuthRoute && !isPublicAsset) {
    // Return 401 for unauthorized API calls
    if (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // For page requests, redirect to the login page
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 