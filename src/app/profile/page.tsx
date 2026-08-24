import { redirect } from "next/navigation";

import { ProfileView } from "@/components/profile/profile-view";
import { getOnboardingStatus } from "@/lib/onboarding/status";
import { getOwnProfile } from "@/lib/profile/data";
import { getAuthUser } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login?next=/profile");
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

  return <ProfileView profile={profile} />;
}
