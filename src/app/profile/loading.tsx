export default function ProfileLoading() {
  return (
    <main className="min-h-dvh bg-muted/30 px-4 py-5 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <div className="h-44 animate-pulse rounded-lg border border-border bg-background" />
          <div className="h-64 animate-pulse rounded-lg border border-border bg-background" />
          <div className="h-52 animate-pulse rounded-lg border border-border bg-background" />
        </div>
        <div className="h-40 animate-pulse rounded-lg border border-border bg-background" />
      </div>
    </main>
  );
}
