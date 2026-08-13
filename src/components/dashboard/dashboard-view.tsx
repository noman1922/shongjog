import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Compass,
  GraduationCap,
  Users,
} from "lucide-react";
import Link from "next/link";

import { FeedList } from "@/components/feed/feed-list";
import { AppShell } from "@/components/shongjog/app-shell";
import { ShongjogCard, SkillPill } from "@/components/shongjog/surface";
import type { HomeFeedData } from "@/lib/feed/data";
import type { PublicProfile } from "@/lib/profile/types";

function formatDate(value: string | null) {
  if (!value) {
    return "Open now";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function initials(name: string | null) {
  return (
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S"
  );
}

function Avatar({ profile }: { profile: PublicProfile }) {
  if (profile.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" className="size-16 rounded-full object-cover" src={profile.avatarUrl} />;
  }

  return (
    <div className="flex size-16 items-center justify-center rounded-full bg-[#E6E9E5] text-lg font-semibold text-[#0F5A47]">
      {initials(profile.fullName)}
    </div>
  );
}

function profileCompletion(profile: PublicProfile) {
  const checks = [
    Boolean(profile.fullName),
    Boolean(profile.username),
    Boolean(profile.bio),
    Boolean(profile.details.universityName),
    Boolean(profile.details.departmentName),
    Boolean(profile.details.graduationYear),
    profile.skills.length > 0,
    profile.projects.length > 0,
  ];

  if (profile.details.role === "student") {
    checks.push(Boolean(profile.details.availabilityText));
  } else {
    checks.push(Boolean(profile.details.companyName));
    checks.push(profile.experiences.length > 0);
  }

  return Math.round(
    (checks.filter(Boolean).length / Math.max(checks.length, 1)) * 100
  );
}

function ProfileSummary({ profile }: { profile: PublicProfile }) {
  const completion = profileCompletion(profile);

  return (
    <ShongjogCard className="p-5">
      <div className="flex flex-col items-center text-center">
        <Avatar profile={profile} />
        <h2 className="mt-3 max-w-full truncate text-base font-bold text-[#191C1B]">
          {profile.fullName ?? "Shongjog member"}
        </h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#0F5A47]">
          {profile.details.role}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#3F4945]">
          {profile.details.universityName ?? profile.details.departmentName ?? "Shongjog network"}
        </p>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-semibold text-[#3F4945]">
          <span>Profile completion</span>
          <span>{completion}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E6E9E5]">
          <div
            className="h-full rounded-full bg-[#0F5A47]"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      <Link
        className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[#0F5A47] text-sm font-semibold text-[#0F5A47] hover:bg-[#0F5A47]/5"
        href="/profile"
      >
        View profile
      </Link>
    </ShongjogCard>
  );
}

function MobileProfileStrip({
  data,
  profile,
}: {
  data: HomeFeedData;
  profile: PublicProfile;
}) {
  return (
    <ShongjogCard className="p-4 lg:hidden">
      <div className="flex items-center gap-3">
        <Avatar profile={profile} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#191C1B]">
            {profile.fullName ?? "Shongjog member"}
          </p>
          <p className="mt-1 truncate text-xs capitalize text-[#3F4945]">
            {profile.details.role} - {profile.details.universityName ?? "Home"}
          </p>
        </div>
        <span className="inline-flex min-h-9 items-center gap-1 rounded-full bg-[#ACF1D7] px-3 text-xs font-semibold text-[#00513F]">
          <Bell aria-hidden="true" className="size-3.5" />
          {data.notificationsCount}
        </span>
      </div>
    </ShongjogCard>
  );
}

function Suggestions({
  data,
  role,
}: {
  data: HomeFeedData;
  role: "student" | "alumni";
}) {
  return (
    <ShongjogCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-[#191C1B]">
          {role === "student" ? "Alumni from your network" : "Students to watch"}
        </h2>
        <Users aria-hidden="true" className="size-5 text-[#0F5A47]" />
      </div>
      <div className="space-y-4">
        {data.suggestions.length > 0 ? (
          data.suggestions.map((suggestion) => (
            <div className="flex items-center gap-3" key={suggestion.id}>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E6E9E5] text-sm font-semibold text-[#0F5A47]">
                {initials(suggestion.fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  className="block truncate text-sm font-semibold text-[#191C1B] hover:text-[#0F5A47]"
                  href={
                    suggestion.username
                      ? `/profile/${suggestion.username}`
                      : "/profile"
                  }
                >
                  {suggestion.fullName ?? "Shongjog member"}
                </Link>
                <p className="truncate text-xs capitalize text-[#747875]">
                  {suggestion.role}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-[#3F4945]">
            Useful member suggestions will appear as your Shongjog network grows.
          </p>
        )}
      </div>
      <Link
        className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#0F5A47] text-sm font-semibold text-[#0F5A47] hover:bg-[#0F5A47]/5"
        href="/discover"
      >
        Open Discover
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </ShongjogCard>
  );
}

function Opportunities({ data }: { data: HomeFeedData }) {
  return (
    <ShongjogCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-[#191C1B]">Relevant opportunities</h2>
        <BriefcaseBusiness aria-hidden="true" className="size-5 text-[#0F5A47]" />
      </div>
      <div className="space-y-4">
        {data.opportunities.length > 0 ? (
          data.opportunities.map((opportunity) => (
            <article
              className="rounded-lg border border-[#BFC9C3]/70 bg-[#F8FAF7] p-4"
              key={opportunity.id}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                {opportunity.type}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-[#191C1B]">
                {opportunity.title}
              </h3>
              <p className="mt-1 text-sm text-[#3F4945]">
                {opportunity.companyName}
                {opportunity.location ? ` - ${opportunity.location}` : ""}
              </p>
              <p className="mt-3 text-xs font-medium text-[#747875]">
                Deadline {formatDate(opportunity.deadline)}
              </p>
            </article>
          ))
        ) : (
          <p className="text-sm leading-6 text-[#3F4945]">
            Open opportunities will appear here once alumni and admins publish them.
          </p>
        )}
      </div>
    </ShongjogCard>
  );
}

function HomeIntro({
  data,
  profile,
}: {
  data: HomeFeedData;
  profile: PublicProfile;
}) {
  return (
    <ShongjogCard className="overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-sm font-medium capitalize text-[#3F4945]">
            <GraduationCap aria-hidden="true" className="size-4 text-[#0F5A47]" />
            {profile.details.role} Home
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#191C1B] sm:text-3xl">
            Home
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#3F4945] sm:text-base">
            Share updates, follow university work, and keep your Shongjog Circle
            moving with relevant posts from students and alumni.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#ACF1D7] px-3 text-sm font-semibold text-[#00513F]">
            <Bell aria-hidden="true" className="size-4" />
            {data.notificationsCount} alerts
          </span>
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#BFC9C3] bg-white px-3 text-sm font-semibold text-[#1E293B] hover:bg-[#F2F4F1]"
            href="/discover"
          >
            <Compass aria-hidden="true" className="size-4" />
            Discover
          </Link>
        </div>
      </div>
    </ShongjogCard>
  );
}

export function DashboardView({
  data,
  profile,
}: {
  data: HomeFeedData;
  profile: PublicProfile;
}) {
  const role = profile.details.role;

  return (
    <AppShell active="Home" profile={profile}>
      <div className="mx-auto grid w-full max-w-[1440px] gap-5 px-4 pb-24 pt-5 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pb-8">
        <aside className="hidden space-y-5 xl:col-span-3 xl:block">
          <ProfileSummary profile={profile} />
          <ShongjogCard className="p-5">
            <h2 className="font-semibold text-[#191C1B]">Your skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.skills.length > 0 ? (
                profile.skills
                  .slice(0, 8)
                  .map((skill) => <SkillPill key={skill.id}>{skill.name}</SkillPill>)
              ) : (
                <p className="text-sm leading-6 text-[#3F4945]">
                  Add skills to improve your feed relevance.
                </p>
              )}
            </div>
          </ShongjogCard>
        </aside>

        <section className="min-w-0 space-y-5 lg:col-span-8 xl:col-span-6">
          <HomeIntro data={data} profile={profile} />
          <MobileProfileStrip data={data} profile={profile} />
          <FeedList data={data} profile={profile} />
        </section>

        <aside className="space-y-5 lg:col-span-4 lg:sticky lg:top-20 lg:self-start xl:col-span-3">
          <Suggestions data={data} role={role} />
          <Opportunities data={data} />
        </aside>
      </div>
    </AppShell>
  );
}
