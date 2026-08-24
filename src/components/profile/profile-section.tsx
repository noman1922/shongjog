import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ProfileSection({
  action,
  children,
  className,
  description,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: string;
  title: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[24px] border border-border/80 dark:border-slate-800 bg-card p-5 sm:p-6 card-shadow transition-colors duration-200",
        className
      )}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 dark:border-slate-800/80 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
