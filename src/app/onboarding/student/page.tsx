import { redirect } from "next/navigation";

import { getOnboardingOptions } from "@/lib/onboarding/options";
import { getOnboardingStatus } from "@/lib/onboarding/status";
import { createClient } from "@/lib/supabase/server";
import { StudentOnboardingForm } from "@/app/onboarding/onboarding-form";

export default async function StudentOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/student");
  }

  const status = await getOnboardingStatus();

  if (status.completed) {
    redirect("/dashboard");
  }

  const { departments, error, skills, universities } = await getOnboardingOptions();

  if (error) {
    return (
      <main className="min-h-dvh bg-background px-4 py-8">
        <section className="mx-auto max-w-xl rounded-lg border border-border p-5">
          <h1 className="text-xl font-semibold">Onboarding is unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            We could not load universities, departments, or skills. Please try
            again shortly.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background">
      <StudentOnboardingForm
        departments={departments}
        role="student"
        skills={skills}
        universities={universities}
      />
    </main>
  );
}
