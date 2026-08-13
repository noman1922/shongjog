import { redirect } from "next/navigation";

import { AppShell } from "@/components/shongjog/app-shell";
import { ShongjogCard } from "@/components/shongjog/surface";
import { getOnboardingStatus } from "@/lib/onboarding/status";
import { getOwnProfile } from "@/lib/profile/data";
import { createClient } from "@/lib/supabase/server";

export async function ProtectedPlaceholder({
  active,
  title,
}: {
  active: string;
  title: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
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

  return (
    <AppShell active={active} profile={profile}>
      <div className="mx-auto w-full max-w-[960px] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
        <ShongjogCard className="p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#14B8A6]">
            Shongjog
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#191C1B]">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-[#3F4945]">
            This section is connected to the new app shell and reserved for the
            next product build-out.
          </p>
        </ShongjogCard>
      </div>
    </AppShell>
  );
}

