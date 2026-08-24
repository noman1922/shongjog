import { BriefcaseBusiness, Plus } from "lucide-react";
import Link from "next/link";

import { FeedList } from "@/components/feed/feed-list";
import { LeftProfileSidebar } from "@/components/dashboard/left-profile-sidebar";
import { RightDiscoverySidebar } from "@/components/dashboard/right-discovery-sidebar";
import { AppShell } from "@/components/shongjog/app-shell";
import { ShongjogCard } from "@/components/shongjog/surface";
import type { HomeFeedData } from "@/lib/feed/data";
import type { PublicProfile } from "@/lib/profile/types";

import { AnnouncementBanner } from "@/components/dashboard/announcement-banner";
import { StoriesRow } from "@/components/dashboard/stories-row";
import type { AdminAnnouncementItem } from "@/lib/admin/data";
import type { StoryRecord } from "@/lib/stories/data";

function formatDate(value: string | null) {
  if (!value) {
    return "Open now";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

/* Right Sidebar Opportunities widget */
function OpportunitiesWidget({ data }: { data: HomeFeedData }) {
  const opportunities = (data?.opportunities ?? []).filter(Boolean);

  return (
    <ShongjogCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-foreground">Opportunities</h3>
          <p className="text-xs text-muted-foreground">Internships, jobs & research</p>
        </div>
        <BriefcaseBusiness className="size-5 text-primary" />
      </div>

      <div className="space-y-3.5">
        {opportunities.length > 0 ? (
          opportunities.slice(0, 3).map((opportunity) => (
            <article
              className="rounded-2xl border border-border/70 dark:border-slate-800 bg-muted/40 p-3.5 transition-colors hover:border-primary/40"
              key={opportunity.id}
            >
              <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                {opportunity.type}
              </span>
              <h4 className="mt-1.5 text-xs sm:text-sm font-bold text-foreground leading-snug">
                {opportunity.title}
              </h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {opportunity.companyName}
                {opportunity.location ? ` · ${opportunity.location}` : ""}
              </p>
              <p className="mt-2 text-[11px] font-medium text-muted-foreground/80">
                Deadline: {formatDate(opportunity.deadline)}
              </p>
            </article>
          ))
        ) : (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Open opportunities from alumni and sponsors will appear here.
          </p>
        )}
      </div>

      <Link
        className="mt-4 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-full border border-border/80 dark:border-slate-700 text-xs font-semibold text-primary hover:bg-muted transition-colors"
        href="/opportunities"
      >
        <span>View all opportunities</span>
      </Link>
    </ShongjogCard>
  );
}

export function DashboardView({
  announcement = null,
  data,
  initialDbStories = [],
  profile,
}: {
  announcement?: AdminAnnouncementItem | null;
  data: HomeFeedData;
  initialDbStories?: StoryRecord[];
  profile: PublicProfile;
}) {
  const role = profile?.details?.role ?? "student";
  const postCount = data?.posts?.length ?? 0;

  return (
    <AppShell active="Home" profile={profile}>
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 md:grid-cols-12 gap-6 px-4 sm:px-6">
        {/* Left Sidebar (3 Columns on Desktop) */}
        <div className="hidden md:col-span-4 lg:col-span-3 md:block">
          <LeftProfileSidebar
            className="sticky top-24"
            postCount={postCount}
            profile={profile}
          />
        </div>

        {/* Center Column (6 Columns on Desktop / 8 on tablet / 12 on mobile) */}
        <section className="col-span-1 md:col-span-8 lg:col-span-6 space-y-6">
          {/* Campus Broadcast Announcement Banner */}
          <AnnouncementBanner announcement={announcement} />

          {/* Stories / Network Highlights */}
          <StoriesRow initialDbStories={initialDbStories} profile={profile} />

          {/* Feed List with Create Post & Posts */}
          <FeedList data={data} profile={profile} />
        </section>

        {/* Right Sidebar (3 Columns on Desktop) */}
        <div className="hidden lg:col-span-3 lg:block space-y-6 lg:sticky lg:top-24 lg:self-start">
          <RightDiscoverySidebar data={data} role={role} />
          <OpportunitiesWidget data={data} />
        </div>
      </div>
    </AppShell>
  );
}
