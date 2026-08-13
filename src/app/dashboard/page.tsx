import { redirect } from "next/navigation";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getHomeFeedData } from "@/lib/feed/data";
import { getOnboardingStatus } from "@/lib/onboarding/status";
import { getOwnProfile } from "@/lib/profile/data";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string | string[] }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const status = await getOnboardingStatus();

  if (!status.completed) {
    redirect("/onboarding");
  }

  if (status.role === "admin") {
    redirect("/admin");
  }

  const profile = await getOwnProfile();

  if (!profile) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const cursor = Array.isArray(params.cursor) ? params.cursor[0] : params.cursor;
  const data = await getHomeFeedData({
    cursor,
    profile,
    userId: user.id,
  });

  return <DashboardView data={data} profile={profile} />;
}
