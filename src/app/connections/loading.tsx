export default function ConnectionsLoading() {
  return (
    <main className="min-h-dvh bg-muted/30 px-4 py-5 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <div className="h-24 animate-pulse rounded-lg border border-border bg-background" />
        <div className="h-48 animate-pulse rounded-lg border border-border bg-background" />
        <div className="h-48 animate-pulse rounded-lg border border-border bg-background" />
        <div className="h-48 animate-pulse rounded-lg border border-border bg-background" />
      </div>
    </main>
  );
}
