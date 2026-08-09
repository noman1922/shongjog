import { LinkButton } from "@/components/ui/button";

export default function ProfileNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md space-y-4 rounded-lg border border-border p-5 text-center">
        <h1 className="text-xl font-semibold">Profile not found</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          That profile link is invalid or no longer available.
        </p>
        <LinkButton
          className="h-11 w-full sm:w-auto"
          href="/profile"
          variant="outline"
        >
          Go to my profile
        </LinkButton>
      </section>
    </main>
  );
}
