import { ArrowRight, GraduationCap, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ShongjogBrand } from "@/components/shongjog/brand";
import { ThemeToggle } from "@/components/shongjog/theme-toggle";
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

  if (status.role === "admin") {
    redirect("/admin");
  }

  if (status.completed) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-dvh bg-background text-foreground px-4 py-8 sm:px-6 sm:py-12 transition-colors duration-200">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        {/* Top brand header */}
        <div className="flex items-center justify-between">
          <ShongjogBrand href="/onboarding" variant="horizontal" />
          <ThemeToggle />
        </div>

        <div className="max-w-2xl space-y-2 pt-2">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            Welcome to Shongjog
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Choose your profile type
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Select how you would like to participate in the university network.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Student Card */}
          <Link
            className="group flex flex-col justify-between rounded-[24px] border border-border/80 dark:border-slate-800 bg-card p-6 sm:p-8 card-shadow transition-all duration-200 hover:border-primary hover:shadow-lg"
            href="/onboarding/student"
          >
            <div className="space-y-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                <GraduationCap className="size-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  University Student
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Build your academic profile, showcase projects, list technical skills, and connect with alumni mentors for internships and advice.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between text-sm font-semibold text-primary">
              <span>Continue as Student</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Alumni Card */}
          <Link
            className="group flex flex-col justify-between rounded-[24px] border border-border/80 dark:border-slate-800 bg-card p-6 sm:p-8 card-shadow transition-all duration-200 hover:border-emerald-500 hover:shadow-lg"
            href="/onboarding/alumni"
          >
            <div className="space-y-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                <UserRoundCheck className="size-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Alumni Mentor
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Share your career experience, current company, domain expertise, and guide younger peers entering the professional landscape.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Continue as Alumni</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
