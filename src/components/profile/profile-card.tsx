import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ProfileCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border/80 dark:border-slate-800 bg-muted/40 dark:bg-slate-800/40 p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md",
        className
      )}
    >
      {children}
    </article>
  );
}
