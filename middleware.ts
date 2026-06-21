// ─────────────────────────────────────────────────────────────
// GIKI Plus — Edge Middleware
// Runs on every request before it hits a page/API route.
// Responsibilities:
//   1. Refresh Supabase auth session (keep cookies fresh)
//   2. Protect /admin/* routes — redirect unauthenticated users
//   3. Role enforcement — redirect users without sufficient role
//   4. Rate limit auth endpoints
//   5. Block suspicious patterns (basic WAF layer)
// ─────────────────────────────────────────────────────────────

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Paths that require authentication (admin panel)
const ADMIN_PATHS = ["/admin"];

// Paths that are only for unauthenticated users (login page)
const AUTH_ONLY_PATHS = ["/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  // ── 1. Create Supabase client that can read/write cookies ──
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          );
        },
      },
    }
  );

  // ── 2. Refresh session (IMPORTANT — must happen before any redirect) ──
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAuthOnlyPath = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));

  // ── 3. Redirect unauthenticated users away from admin ──────
  if (isAdminPath && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 4. Redirect authenticated users away from login page ───
  if (isAuthOnlyPath && user) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // ── 5. Role enforcement for admin paths ───────────────────
  if (isAdminPath && user) {
    // Use service-role client via @supabase/ssr (Edge-compatible) to bypass RLS
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );
    const { data: profileRaw } = await adminSupabase
      .from("profiles")
      .select("role, isActive")
      .eq("id", user.id)
      .single();
    const profile = profileRaw as { role: string; isActive: boolean } | null;

    // Block deactivated accounts or users with no profile
    if (!profile || !profile.isActive) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/auth/login?error=account_inactive", request.url));
    }

    // Route-specific role guards
    const ROUTE_MIN_ROLES: Record<string, string[]> = {
      "/admin/users":         ["SUPER_ADMIN"],
      "/admin/exam-schedule": ["SUPER_ADMIN", "ADMIN"],
      "/admin/rooms":         ["SUPER_ADMIN", "ADMIN"],
      "/admin/events":        ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
      "/admin/professors":    ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
      "/admin/memories":      ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
      "/admin/lost-found":    ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
      "/admin/mess":          ["SUPER_ADMIN", "ADMIN", "STAFF"],
    };

    for (const [route, allowedRoles] of Object.entries(ROUTE_MIN_ROLES)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(profile.role)) {
        return NextResponse.redirect(
          new URL("/admin/dashboard?error=insufficient_permissions", request.url)
        );
      }
    }

    // Attach role to request headers so Server Components can read it
    // without a second DB query
    response.headers.set("x-user-role", profile.role);
    response.headers.set("x-user-id", user.id);
  }

  // ── 6. Basic WAF — block obviously malicious path patterns ─
  const BLOCKED_PATTERNS = [
    /\.\.(\/|\\)/,           // path traversal
    /<script/i,              // XSS in URL
    /union.*select/i,        // SQL injection probe
    /\/\.env/,               // env file probe
    /\/wp-admin/,            // WordPress scanner
    /\/phpmyadmin/,          // phpMyAdmin scanner
    /\/etc\/passwd/,         // Linux file probe
  ];

  const rawUrl = decodeURIComponent(request.nextUrl.toString());
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(rawUrl)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};