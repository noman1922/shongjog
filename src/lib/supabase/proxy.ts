import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getSupabaseProxyConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase proxy environment variables.");
  }

  return { supabaseKey, supabaseUrl };
}

function copyResponseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
}

export async function updateSession(request: NextRequest) {
  const { supabaseKey, supabaseUrl } = getSupabaseProxyConfig();
  const requestHeaders = new Headers(request.headers);
  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies
          .getAll()
          .filter((c) => c.value && c.value.trim() !== "" && c.value !== '""');
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: string | null = null;

  if (user) {
    requestHeaders.set("x-user-id", user.id);

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    userRole =
      (profile?.role as string | undefined) ??
      (user.app_metadata?.role as string | undefined) ??
      (user.user_metadata?.role as string | undefined) ??
      null;

    if (userRole) {
      requestHeaders.set("x-user-role", userRole);
    }
  }

  const pathname = request.nextUrl.pathname;

  // 1. Unauthenticated Request Guards
  if (!user) {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/messages") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/connections") ||
      pathname.startsWith("/discover")
    ) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      redirectUrl.searchParams.set("next", pathname);

      const redirectResponse = NextResponse.redirect(redirectUrl);
      copyResponseCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }

    if (pathname.startsWith("/admin")) {
      if (pathname === "/admin/login") {
        return supabaseResponse;
      }

      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";

      const redirectResponse = NextResponse.redirect(redirectUrl);
      copyResponseCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }

    if (pathname.startsWith("/onboarding")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", pathname);

      const redirectResponse = NextResponse.redirect(redirectUrl);
      copyResponseCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }

    return supabaseResponse;
  }

  // 2. Authenticated Admin Route Routing & Bypasses
  if (userRole === "admin") {
    // If admin is on onboarding, dashboard, login, admin/login, or root -> direct to /admin
    if (
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/dashboard") ||
      pathname === "/admin/login" ||
      pathname === "/login" ||
      pathname === "/"
    ) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin";
      redirectUrl.search = "";

      const redirectResponse = NextResponse.redirect(redirectUrl);
      copyResponseCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }

    return supabaseResponse;
  }

  // 3. Authenticated Non-Admin Route Guards
  if (userRole !== "admin") {
    // Disallow non-admins from /admin or /admin/*
    if (pathname.startsWith("/admin")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";

      const redirectResponse = NextResponse.redirect(redirectUrl);
      copyResponseCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }

    // Redirect away from login page if already signed in
    if (pathname === "/login") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";

      const redirectResponse = NextResponse.redirect(redirectUrl);
      copyResponseCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }
  }

  return supabaseResponse;
}
