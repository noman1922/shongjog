import Image from "next/image";
import Link from "next/link";

import { ProfileConnectionActions } from "@/components/connections/connection-actions";
import { StartMessageButton } from "@/components/messages/start-message-button";
import { getInitials } from "@/lib/utils";
import { ShongjogCard, SkillPill } from "@/components/shongjog/surface";
import { LinkButton } from "@/components/ui/button";
import type { DiscoverPerson } from "@/lib/discover/data";

export function DiscoveryProfileCard({ person }: { person: DiscoverPerson }) {
  const profileHref = person.username ? `/profile/${person.username}` : "/profile";
  const isStudent = person.role === "student";

  return (
    <ShongjogCard className="p-5 transition-all duration-200 hover:border-primary/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Avatar */}
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20 shadow-sm">
          {person.avatarUrl ? (
            <Image
              alt={person.fullName ?? "Avatar"}
              className="size-full rounded-full object-cover"
              height={64}
              src={person.avatarUrl}
              width={64}
            />
          ) : (
            <div className="flex size-full items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {getInitials(person.fullName)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <Link
                className="break-words text-base sm:text-lg font-bold text-foreground hover:text-primary transition-colors"
                href={profileHref}
              >
                {person.fullName ?? "Shongjog member"}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold capitalize ${
                    isStudent
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                      : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                  }`}
                >
                  {person.role}
                </span>
                {person.universityName ? <span>· {person.universityName}</span> : null}
                {person.departmentName ? <span>· {person.departmentName}</span> : null}
              </div>
              {person.roleLine ? (
                <p className="mt-1 text-xs sm:text-sm font-medium text-foreground/90">
                  {person.roleLine}
                </p>
              ) : null}
            </div>
          </div>

          {person.bio ? (
            <p className="mt-3 line-clamp-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {person.bio}
            </p>
          ) : null}

          {person.skills.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {person.skills.map((skill) => (
                <SkillPill key={skill}>{skill}</SkillPill>
              ))}
            </div>
          ) : null}

          {person.matchReasons.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {person.matchReasons.map((reason) => (
                <span
                  className="rounded-full border border-border/80 bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                  key={reason}
                >
                  {reason}
                </span>
              ))}
            </div>
          ) : null}

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-1 border-t border-border/60 dark:border-slate-800">
            <LinkButton
              className="h-9 rounded-full border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold px-4"
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
    </ShongjogCard>
  );
}
