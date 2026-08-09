import type { ReactNode } from "react";

export function ProfileCard({ children }: { children: ReactNode }) {
  return (
    <article className="rounded-lg border border-border bg-background p-4">
      {children}
    </article>
  );
}
