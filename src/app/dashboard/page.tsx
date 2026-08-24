import { redirect } from "next/navigation";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getHomeFeedData } from "@/lib/feed/data";
import { getOnboardingStatus } from "@/lib/onboarding/status";
import { getOwnProfile } from "@/lib/profile/data";
import { getAuthUser } from "@/lib/supabase/server";

import { getAdminAnnouncementsList } from "@/lib/admin/data";
import { getActiveDbStories } from "@/lib/stories/data";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string | string[] }>;
}) {
  const user = await getAuthUser();

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

  try {
    const [data, initialDbStories, announcements] = await Promise.all([
      getHomeFeedData({
        cursor,
        profile,
        userId: user.id,
      }),
      getActiveDbStories(user.id, profile.details.universityId),
      getAdminAnnouncementsList(),
    ]);

    const activeAnnouncement = announcements.find((a) => a.isActive) ?? null;

    return (
      <DashboardView
        announcement={activeAnnouncement}
        data={data}
        initialDbStories={initialDbStories}
        profile={profile}
      />
    );
  } catch (error) {
    console.error("Dashboard feed loading error:", error);
    const fallbackData = {
      nextCursor: null,
      notificationsCount: 0,
      opportunities: [],
      posts: [],
      suggestions: [],
    };
    return <DashboardView data={fallbackData} profile={profile} />;
  }
}
