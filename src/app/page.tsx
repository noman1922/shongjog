import { redirect } from "next/navigation";

import { LandingPage } from "@/components/landing/landing-page";
import { getOnboardingStatus } from "@/lib/onboarding/status";
import { getAuthUser } from "@/lib/supabase/server";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; signup?: string }>;
}) {
  const user = await getAuthUser();

  if (user) {
    const status = await getOnboardingStatus();

    if (status.role === "admin") {
      redirect("/admin");
    }

    if (!status.completed) {
      redirect("/onboarding");
    }

    redirect("/dashboard");
  }

  const params = await searchParams;

  return <LandingPage error={params.error} signup={params.signup} />;
}
