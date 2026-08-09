import { redirect } from "next/navigation";

import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { getOnboardingOptions } from "@/lib/onboarding/options";
import { getOnboardingStatus } from "@/lib/onboarding/status";
import { getOwnProfile } from "@/lib/profile/data";
import { createClient } from "@/lib/supabase/server";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile/edit");
  }

  const status = await getOnboardingStatus();

  if (!status.completed) {
    redirect("/onboarding");
  }

  const [profile, options] = await Promise.all([
    getOwnProfile(),
    getOnboardingOptions(),
  ]);

  if (!profile) {
    redirect("/onboarding");
  }

  if (options.error) {
    return (
      <main className="min-h-dvh bg-background px-4 py-8">
        <section className="mx-auto max-w-xl rounded-lg border border-border p-5">
          <h1 className="text-xl font-semibold">Profile editing is unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            We could not load universities, departments, or skills. Please try
            again shortly.
          </p>
        </section>
      </main>
    );
  }

  return (
    <ProfileEditForm
      departments={options.departments}
      profile={profile}
      skills={options.skills}
      universities={options.universities}
    />
  );
}
