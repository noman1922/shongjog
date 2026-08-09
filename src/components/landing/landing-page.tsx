import { GraduationCap, LogIn, UserPlus } from "lucide-react";

import { signInWithGoogle } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

function BrandMark() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <GraduationCap aria-hidden="true" className="size-5" />
      </span>
      <span className="text-lg font-semibold tracking-tight">Shongjog</span>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-muted/30 px-4 py-5 text-foreground sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-5xl flex-col">
        <header className="py-3">
          <BrandMark />
        </header>

        <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:py-12">
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              University student and alumni networking
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Welcome to Shongjog
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Connect with students and alumni from your university, discover
              skills and projects, and find opportunities through an academic
              community built around shared roots.
            </p>
          </div>

          <div className="grid gap-4">
            <section className="rounded-lg border border-border bg-background p-5 shadow-sm">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">Log in</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Continue with the Google account already connected to
                  Shongjog.
                </p>
              </div>
              <form action={signInWithGoogle} className="mt-5">
                <input name="next" type="hidden" value="/profile" />
                <Button className="h-11 w-full" size="lg" type="submit">
                  <LogIn aria-hidden="true" />
                  Log in with Google
                </Button>
              </form>
            </section>

            <section className="rounded-lg border border-border bg-background p-5 shadow-sm">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">
                  Create account
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Start with Google. New members will complete a short student
                  or alumni onboarding profile.
                </p>
              </div>
              <form action={signInWithGoogle} className="mt-5">
                <input name="next" type="hidden" value="/profile" />
                <Button
                  className="h-11 w-full"
                  size="lg"
                  type="submit"
                  variant="outline"
                >
                  <UserPlus aria-hidden="true" />
                  Create account with Google
                </Button>
              </form>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
