import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

import { getOnboardingStatus } from "@/lib/onboarding/status";
import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const nextParam = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (code || (tokenHash && type)) {
    const supabase = await createClient();
    let authSuccessful = false;

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      authSuccessful = !error;
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });
      authSuccessful = !error;
    }

    if (authSuccessful) {
      const status = await getOnboardingStatus();

      if (status.role === "admin") {
        return NextResponse.redirect(
          new URL("/admin", request.url)
        );
      }

      if (!status.completed) {
        const target = nextParam?.startsWith("/onboarding")
          ? nextParam
          : "/onboarding";
        return NextResponse.redirect(new URL(target, request.url));
      }

      return NextResponse.redirect(
        new URL(nextParam ?? "/dashboard", request.url)
      );
    }
  }

  return NextResponse.redirect(new URL("/?error=auth_callback", request.url));
}

