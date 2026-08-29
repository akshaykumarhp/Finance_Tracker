import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Refreshes the auth session on every request and guards protected routes.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() runs on every request (it's what refreshes the session cookie).
  // A slow/stuck Supabase response would otherwise hang every page until
  // Vercel's function timeout kills it — race it so a stall just treats the
  // user as logged-out instead of freezing the whole site.
  const result = await Promise.race([
    supabase.auth.getUser().catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
  ]);
  const user = result?.data.user ?? null;

  const path = request.nextUrl.pathname;
  const isAuthRoute = path === "/login" || path === "/signup";
  // /auth/* handles the recovery/confirmation callback and must run even
  // when there is no session yet (it's what establishes the session).
  const isPublicAsset =
    path === "/" || path.startsWith("/_next") || path.startsWith("/auth");

  // Not logged in and trying to reach a protected page -> send to login.
  if (!user && !isAuthRoute && !isPublicAsset) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged in but on an auth page -> send to dashboard.
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
