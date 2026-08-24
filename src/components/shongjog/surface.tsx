import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ShongjogCard({
  children,
  className,
  hoverable = false,
  as: Component = "section",
}: {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  as?: ElementType;
}) {
  return (
    <Component
      className={cn(
        "rounded-[24px] border border-border/80 dark:border-slate-800 bg-card text-card-foreground card-shadow transition-colors duration-200",
        hoverable && "hover-shadow cursor-pointer",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function SkillPill({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "primary" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-medium transition-colors",
        variant === "default" &&
          "border border-border/80 dark:border-slate-700 bg-muted/60 dark:bg-slate-800/80 text-foreground dark:text-slate-200 hover:border-primary/40",
        variant === "primary" &&
          "border border-primary/20 bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 font-semibold",
        variant === "accent" &&
          "border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300",
        className
      )}
    >
      {children}
    </span>
  );
}
