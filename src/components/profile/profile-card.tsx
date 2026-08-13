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
        "rounded-lg border border-[#BFC9C3]/80 bg-[#F8FAF7] p-4 transition hover:shadow-[0_10px_18px_rgba(30,41,59,0.08)]",
        className
      )}
    >
      {children}
    </article>
  );
}
