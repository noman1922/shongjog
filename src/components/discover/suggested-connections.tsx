"use client";

import { Check, Clock, Sparkles, UserPlus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import { sendConnectionRequestAction } from "@/app/connections/actions";
import { ShongjogCard, SkillPill } from "@/components/shongjog/surface";
import type { SuggestedConnectionPerson } from "@/lib/discover/data";
import { getInitials } from "@/lib/utils";

function ConnectButton({
  receiverId,
  receiverUsername,
}: {
  receiverId: string;
  receiverUsername: string | null;
}) {
  const [isPending, setIsPending] = useState(false);
  const [, startTransition] = useTransition();

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    startTransition(async () => {
      setIsPending(true);
      const formData = new FormData();
      formData.set("receiverId", receiverId);
      formData.set("receiverUsername", receiverUsername ?? "");
      await sendConnectionRequestAction(formData);
    });
  };

  if (isPending) {
    return (
      <span className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 px-4 text-xs font-semibold text-amber-700 dark:text-amber-300 w-full sm:w-auto shadow-sm">
        <Clock className="size-3.5" />
        <span>Pending</span>
      </span>
    );
  }

  return (
    <form className="w-full sm:w-auto" onSubmit={handleConnect}>
      <button
        className="inline-flex h-9 w-full sm:w-auto items-center justify-center gap-1.5 rounded-full bg-primary hover:bg-primary/90 text-white px-4 text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
        type="submit"
      >
        <UserPlus className="size-3.5" />
        <span>Connect</span>
      </button>
    </form>
  );
}

export function SuggestedConnectionsGrid({
  suggestions,
}: {
  suggestions: SuggestedConnectionPerson[];
}) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              People You May Know
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Recommendations based on your university, department, and shared skills.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          <Sparkles className="size-3.5" />
          {suggestions.length} Suggested
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {suggestions.map((person) => {
          const profileHref = person.username
            ? `/profile/${person.username}`
            : "/profile";
          const isStudent = person.role === "student";

          return (
            <ShongjogCard
              className="p-5 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all duration-200 group"
              key={person.id}
            >
              <div className="space-y-3">
                {/* Header with Avatar & Badge */}
                <div className="flex items-start justify-between gap-3">
                  <Link
                    className="relative size-14 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20 shadow-sm group-hover:ring-primary/40 transition-all"
                    href={profileHref}
                  >
                    {person.avatarUrl ? (
                      <Image
                        alt={person.fullName ?? "Avatar"}
                        className="size-full rounded-full object-cover"
                        height={56}
                        src={person.avatarUrl}
                        width={56}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                        {getInitials(person.fullName)}
                      </div>
                    )}
                  </Link>

                  <span className="inline-flex items-center rounded-full bg-muted/70 dark:bg-slate-800 border border-border px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {person.matchBadge}
                  </span>
                </div>

                {/* Name & Academic Meta */}
                <div>
                  <Link
                    className="block font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate"
                    href={profileHref}
                  >
                    {person.fullName ?? "Shongjog Member"}
                  </Link>

                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.2 text-[10px] font-semibold capitalize ${
                        isStudent
                          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                          : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                      }`}
                    >
                      {person.role}
                    </span>
                    {person.universityName ? (
                      <span className="truncate max-w-[150px]">
                        · {person.universityName}
                      </span>
                    ) : null}
                  </div>

                  {person.roleLine ? (
                    <p className="mt-1 text-xs text-muted-foreground/90 truncate">
                      {person.roleLine}
                    </p>
                  ) : null}
                </div>

                {/* Mutual/Top Skills */}
                {person.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {person.skills.map((skill) => (
                      <SkillPill key={skill}>{skill}</SkillPill>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/60 dark:border-slate-800">
                <ConnectButton
                  receiverId={person.id}
                  receiverUsername={person.username}
                />
                <Link
                  className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors text-center"
                  href={profileHref}
                >
                  View Profile
                </Link>
              </div>
            </ShongjogCard>
          );
        })}
      </div>
    </section>
  );
}
