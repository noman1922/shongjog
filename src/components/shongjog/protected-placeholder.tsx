import { Briefcase, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/shongjog/app-shell";
import { ShongjogCard } from "@/components/shongjog/surface";
import { getOnboardingStatus } from "@/lib/onboarding/status";
import { getViewerProfile } from "@/lib/profile/data";
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

  const profile = await getViewerProfile();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <AppShell active={active} profile={profile}>
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <ShongjogCard className="p-8 sm:p-12 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-4 shadow-sm">
            <Briefcase className="size-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary mb-3">
            <Sparkles className="size-3.5" />
            <span>Coming Soon</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title} Hub
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Discover curated internships, research grants, job openings, and alumni mentorship programs specifically tailored for your department and university circle.
          </p>
        </ShongjogCard>
      </div>
    </AppShell>
  );
}
