import { BriefcaseBusiness } from "lucide-react";

import { ShongjogCard } from "@/components/shongjog/surface";
import type { DiscoverOpportunity } from "@/lib/discover/data";

export function DiscoveryOpportunityCard({
  opportunity,
}: {
  opportunity: DiscoverOpportunity;
}) {
  return (
    <ShongjogCard className="p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BriefcaseBusiness className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            {opportunity.type}
          </span>
          <h3 className="mt-1 font-bold text-sm sm:text-base text-foreground leading-snug">
            {opportunity.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {opportunity.companyName}
            {opportunity.location ? ` · ${opportunity.location}` : ""}
          </p>
        </div>
      </div>
    </ShongjogCard>
  );
}
