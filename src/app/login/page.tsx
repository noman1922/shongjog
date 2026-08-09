import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/app/login/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath =
    params.next?.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12">
      <section className="w-full max-w-sm space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Shongjog</p>
          <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Continue to your Shongjog workspace.
          </p>
        </div>

        <form action={signInWithGoogle} className="space-y-4">
          <input name="next" type="hidden" value={nextPath} />
          <Button className="h-11 w-full" size="lg" type="submit" variant="outline">
            <LogIn aria-hidden="true" />
            Continue with Google
          </Button>
        </form>

        {params.error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Authentication could not be completed. Please try again.
          </p>
        ) : null}
      </section>
    </main>
  );
}
