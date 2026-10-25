import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require the user to be logged-in
const PROTECTED_PREFIXES = ['/admin', '/technician', '/customer'];

// Routes only accessible when NOT logged-in
const AUTH_ONLY_ROUTES = ['/login', '/register'];

const ADMIN_API_PREFIX = '/api/admin';

const ROLE_BY_PREFIX: Record<string, string> = {
  '/admin': 'admin',
  '/technician': 'technician',
  '/customer': 'customer',
};

const DASHBOARD_BY_ROLE: Record<string, string> = {
  admin: '/admin/dashboard',
  technician: '/technician/dashboard',
  customer: '/customer/dashboard',
};

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

  // [K-08] Protect admin API routes
  if (pathname.startsWith(ADMIN_API_PREFIX)) {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return supabaseResponse;
  }

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

  // [K-01] Redirect authenticated users accessing mismatched role dashboards
  const matchedPrefix = PROTECTED_PREFIXES.find((r) => pathname.startsWith(r));
  if (user && matchedPrefix) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;
    if (role && role !== ROLE_BY_PREFIX[matchedPrefix] && DASHBOARD_BY_ROLE[role]) {
      return NextResponse.redirect(new URL(DASHBOARD_BY_ROLE[role], request.url));
    }
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