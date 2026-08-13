import { BriefcaseBusiness } from "lucide-react";

import type { DiscoverOpportunity } from "@/lib/discover/data";

export function DiscoveryOpportunityCard({
  opportunity,
}: {
  opportunity: DiscoverOpportunity;
}) {
  return (
    <article className="rounded-xl border border-[#BFC9C3] bg-white p-4 shadow-[0_4px_12px_rgba(30,41,59,0.04)]">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#ECEEEB] text-[#0F5A47]">
          <BriefcaseBusiness aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase text-[#14B8A6]">
            {opportunity.type}
          </p>
          <h3 className="mt-1 font-bold text-[#191C1B]">{opportunity.title}</h3>
          <p className="mt-1 text-sm text-[#3F4945]">
            {opportunity.companyName}
            {opportunity.location ? ` • ${opportunity.location}` : ""}
          </p>
        </div>
      </div>
    </article>
  );
}

