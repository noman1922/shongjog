import Link from "next/link";

import { ProfileConnectionActions } from "@/components/connections/connection-actions";
import { StartMessageButton } from "@/components/messages/start-message-button";
import { SkillPill } from "@/components/shongjog/surface";
import { LinkButton } from "@/components/ui/button";
import type { DiscoverPerson } from "@/lib/discover/data";

function initials(name: string | null) {
  return name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "S";
}

export function DiscoveryProfileCard({ person }: { person: DiscoverPerson }) {
  const profileHref = person.username ? `/profile/${person.username}` : "/profile";

  return (
    <article className="rounded-xl border border-[#BFC9C3] bg-white p-4 shadow-[0_4px_12px_rgba(30,41,59,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {person.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="size-16 shrink-0 rounded-full border border-[#BFC9C3] object-cover"
            src={person.avatarUrl}
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#E6E9E5] text-lg font-bold text-[#0F5A47]">
            {initials(person.fullName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <Link
                className="break-words text-lg font-bold text-[#191C1B] hover:text-[#0F5A47]"
                href={profileHref}
              >
                {person.fullName ?? "Shongjog member"}
              </Link>
              <p className="mt-1 text-sm capitalize text-[#747875]">
                {person.role}
                {person.universityName ? ` • ${person.universityName}` : ""}
              </p>
              {person.departmentName ? (
                <p className="text-sm text-[#747875]">{person.departmentName}</p>
              ) : null}
              {person.roleLine ? (
                <p className="mt-1 text-sm font-medium text-[#1E293B]">
                  {person.roleLine}
                </p>
              ) : null}
            </div>
            <span className="w-fit rounded-full bg-[#ACF1D7] px-3 py-1 text-xs font-semibold text-[#00513F]">
              Match {person.score}
            </span>
          </div>

          {person.bio ? (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#3F4945]">
              {person.bio}
            </p>
          ) : null}

          {person.skills.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {person.skills.map((skill) => (
                <SkillPill key={skill}>{skill}</SkillPill>
              ))}
            </div>
          ) : null}

          {person.matchReasons.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {person.matchReasons.map((reason) => (
                <span
                  className="rounded-full border border-[#BFC9C3] px-2.5 py-1 text-xs font-medium text-[#3F4945]"
                  key={reason}
                >
                  {reason}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <LinkButton
              className="h-11 w-full border-[#0F5A47] text-[#0F5A47] sm:w-auto"
              href={profileHref}
              variant="outline"
            >
              View Profile
            </LinkButton>
            <ProfileConnectionActions
              profileUserId={person.id}
              profileUsername={person.username}
              state={person.connectionState}
            />
            {person.connectionState.kind === "connected" ? (
              <StartMessageButton otherUserId={person.id} />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
