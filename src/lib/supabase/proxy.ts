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
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && pathname.startsWith("/dashboard")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);

    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyResponseCookies(supabaseResponse, redirectResponse);

    return redirectResponse;
  }

  if (!user && pathname.startsWith("/onboarding")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);

    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyResponseCookies(supabaseResponse, redirectResponse);

    return redirectResponse;
  }

  if (
    user &&
    (pathname === "/login" ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/onboarding"))
  ) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      if (pathname.startsWith("/onboarding")) {
        return supabaseResponse;
      }

      const redirectResponse = NextResponse.redirect(
        new URL("/onboarding", request.url)
      );
      copyResponseCookies(supabaseResponse, redirectResponse);

      return redirectResponse;
    }

    if (profile.role === "admin") {
      if (pathname.startsWith("/onboarding") || pathname === "/login") {
        const redirectResponse = NextResponse.redirect(
          new URL("/profile", request.url)
        );
        copyResponseCookies(supabaseResponse, redirectResponse);

        return redirectResponse;
      }

      return supabaseResponse;
    }

    const profileTable =
      profile.role === "alumni" ? "alumni_profiles" : "student_profiles";
    const { data: roleProfile } = await supabase
      .from(profileTable)
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleProfile && (pathname.startsWith("/onboarding") || pathname === "/login")) {
      const redirectResponse = NextResponse.redirect(
        new URL("/profile", request.url)
      );
      copyResponseCookies(supabaseResponse, redirectResponse);

      return redirectResponse;
    }

    if (!roleProfile && (pathname.startsWith("/dashboard") || pathname === "/login")) {
      const redirectResponse = NextResponse.redirect(
        new URL("/onboarding", request.url)
      );
      copyResponseCookies(supabaseResponse, redirectResponse);

      return redirectResponse;
    }
  }

  return supabaseResponse;
}
