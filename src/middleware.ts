import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require the user to be logged-in
const PROTECTED_PREFIXES = ['/admin', '/technician', '/customer'];

// Routes only accessible when NOT logged-in
const AUTH_ONLY_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Securely get the user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 1. If authenticated and visiting auth-only pages, redirect to dashboard depending on role
  if (user && (AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r)) || pathname === '/')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role) {
      let dashboardPath = '/customer/dashboard';
      if (profile.role === 'admin') dashboardPath = '/admin/dashboard';
      if (profile.role === 'technician') dashboardPath = '/technician/dashboard';
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  // 2. Redirect unauthenticated users away from protected pages
  if (!user && PROTECTED_PREFIXES.some((r) => pathname.startsWith(r))) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public files (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};