import { redirect } from "next/navigation";

import { AlumniOnboardingForm } from "@/components/onboarding/alumni-onboarding-form";
import { ShongjogBrand } from "@/components/shongjog/brand";
import { ThemeToggle } from "@/components/shongjog/theme-toggle";
import { getOnboardingOptions } from "@/lib/onboarding/options";
import { getOnboardingStatus } from "@/lib/onboarding/status";
import { createClient } from "@/lib/supabase/server";

export default async function AlumniOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/alumni");
  }

  const status = await getOnboardingStatus();

  if (status.role === "admin") {
    redirect("/admin");
  }

  if (status.completed) {
    redirect("/dashboard");
  }

  const [{ departments, skills, universities }, { data: profile }] =
    await Promise.all([
      getOnboardingOptions(),
      supabase
        .from("users")
        .select("full_name, username, avatar_url")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

  const defaultValues = {
    avatarUrl: profile?.avatar_url ?? null,
    fullName:
      profile?.full_name ??
      (user.user_metadata?.full_name as string) ??
      "",
    username:
      profile?.username ??
      (user.user_metadata?.username as string) ??
      "",
  };

  return (
    <main className="min-h-dvh bg-background text-foreground px-4 py-6 sm:px-6 sm:py-10 transition-colors duration-200">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 sm:gap-8">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <ShongjogBrand href="/onboarding" variant="horizontal" />
          <ThemeToggle />
        </div>

        {/* Alumni Form */}
        <AlumniOnboardingForm
          defaultValues={defaultValues}
          departments={departments}
          skills={skills}
          universities={universities}
        />
      </div>
    </main>
  );
}
