import Link from "next/link";
import { GraduationCap, UserRoundCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getOnboardingStatus } from "@/lib/onboarding/status";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  const status = await getOnboardingStatus();

  if (status.completed) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-6 sm:px-6 sm:py-10">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Shongjog</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Choose your profile type
          </h1>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Pick the path that matches how you will use the university network.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            className="group flex min-h-56 flex-col justify-between rounded-lg border border-border p-5 transition hover:border-foreground/30 hover:bg-muted/40"
            href="/onboarding/student"
          >
            <span className="space-y-4">
              <span className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <GraduationCap aria-hidden="true" />
              </span>
              <span className="block space-y-2">
                <span className="block text-xl font-semibold">Student</span>
                <span className="block text-sm leading-6 text-muted-foreground">
                  Build a profile around your university, department, skills,
                  graduation year, and internship availability.
                </span>
              </span>
            </span>
            <Button className="mt-6 h-11 w-full sm:w-fit" size="lg">
              Continue as Student
            </Button>
          </Link>

          <Link
            className="group flex min-h-56 flex-col justify-between rounded-lg border border-border p-5 transition hover:border-foreground/30 hover:bg-muted/40"
            href="/onboarding/alumni"
          >
            <span className="space-y-4">
              <span className="flex size-11 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <UserRoundCheck aria-hidden="true" />
              </span>
              <span className="block space-y-2">
                <span className="block text-xl font-semibold">Alumni</span>
                <span className="block text-sm leading-6 text-muted-foreground">
                  Share your professional background, company, field, and skills
                  to help students discover you.
                </span>
              </span>
            </span>
            <Button className="mt-6 h-11 w-full sm:w-fit" size="lg" variant="outline">
              Continue as Alumni
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
