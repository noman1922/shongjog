import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ProfileSection({
  action,
  children,
  className,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[#BFC9C3] bg-white p-5 shadow-[0_4px_12px_rgba(30,41,59,0.04)] sm:p-6",
        className
      )}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold tracking-tight text-[#191C1B] sm:text-xl">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
