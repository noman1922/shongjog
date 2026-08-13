import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ShongjogCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[#BFC9C3] bg-white shadow-[0_4px_12px_rgba(30,41,59,0.04)]",
        className
      )}
    >
      {children}
    </section>
  );
}

export function SkillPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#BFC9C3]/70 bg-[#F1F5F9] px-3 py-1 text-sm font-medium text-[#1E293B]">
      {children}
    </span>
  );
}

