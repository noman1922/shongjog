import { redirect } from "next/navigation";

import { LandingPage } from "@/components/landing/landing-page";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; signup?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "admin") {
      redirect("/admin");
    }

    redirect("/dashboard");
  }

  const params = await searchParams;

  return <LandingPage error={params.error} signup={params.signup} />;
}
