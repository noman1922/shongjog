import { redirect } from "next/navigation";

import { getOnboardingStatus } from "@/lib/onboarding/status";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
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

  return (
    <main className="min-h-dvh bg-background px-6 py-10">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome to Shongjog</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            You are signed in as {user.email ?? "your Supabase account"}.
          </p>
        </div>
      </section>
    </main>
  );
}
