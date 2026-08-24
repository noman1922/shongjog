"use client";

import { ArrowRight, Check, Clock, Compass, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import { sendConnectionRequestAction } from "@/app/connections/actions";
import { ShongjogCard } from "@/components/shongjog/surface";
import type { HomeFeedData } from "@/lib/feed/data";
import { getInitials } from "@/lib/utils";

function SidebarConnectButton({
  initialStatus,
  receiverId,
  receiverUsername,
}: {
  initialStatus?: "pending" | "accepted" | null;
  receiverId: string;
  receiverUsername: string | null;
}) {
  const [status, setStatus] = useState<"pending" | "accepted" | "none">(
    initialStatus === "accepted"
      ? "accepted"
      : initialStatus === "pending"
      ? "pending"
      : "none"
  );
  const [isPending, startTransition] = useTransition();

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "none") return;

    startTransition(async () => {
      setStatus("pending");
      const formData = new FormData();
      formData.set("receiverId", receiverId);
      formData.set("receiverUsername", receiverUsername ?? "");
      await sendConnectionRequestAction(formData);
    });
  };

  if (status === "accepted") {
    return (
      <Link
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
        href={`/messages`}
      >
        <Check className="size-3" />
        <span>Connected</span>
      </Link>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 shadow-sm">
        <Clock className="size-3" />
        <span>Pending</span>
      </span>
    );
  }

  return (
    <form onSubmit={handleConnect}>
      <button
        className="shrink-0 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-95"
        disabled={isPending}
        type="submit"
      >
        Connect
      </button>
    </form>
  );
}

interface RightDiscoverySidebarProps {
  className?: string;
  data: HomeFeedData;
  role: "student" | "alumni";
}

export function RightDiscoverySidebar({
  className = "",
  data,
  role,
}: RightDiscoverySidebarProps) {
  const isStudent = role === "student";
  const suggestions = (data?.suggestions ?? []).filter(Boolean);

  return (
    <aside className={`space-y-6 ${className}`}>
      {/* Suggestions / Network Discovery Card */}
      <ShongjogCard className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-foreground">
              {isStudent ? "Alumni Mentors" : "Students to Watch"}
            </h3>
            <p className="text-xs text-muted-foreground">From your university network</p>
          </div>
          <Users className="size-5 text-primary" />
        </div>

        <div className="space-y-4">
          {suggestions.length > 0 ? (
            suggestions.slice(0, 5).map((suggestion) => {
              const profileHref = suggestion.username
                ? `/profile/${suggestion.username}`
                : "/profile";

              return (
                <div
                  className="flex items-center justify-between gap-3 group"
                  key={suggestion.id}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Link
                      className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20 shadow-sm hover:opacity-90 transition-opacity"
                      href={profileHref}
                    >
                      {suggestion.avatarUrl ? (
                        <Image
                          alt={suggestion.fullName ?? "Avatar"}
                          className="size-full rounded-full object-cover"
                          height={40}
                          src={suggestion.avatarUrl}
                          width={40}
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {getInitials(suggestion.fullName)}
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0">
                      <Link
                        className="block truncate text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors"
                        href={profileHref}
                      >
                        {suggestion.fullName ?? "Shongjog member"}
                      </Link>
                      <p className="truncate text-[11px] capitalize text-muted-foreground">
                        {suggestion.role}
                      </p>
                    </div>
                  </div>

                  <SidebarConnectButton
                    initialStatus={suggestion.connectionStatus}
                    receiverId={suggestion.id}
                    receiverUsername={suggestion.username}
                  />
                </div>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Member recommendations will appear as you expand your Circles.
            </p>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-border/60 dark:border-slate-800">
          <Link
            className="flex items-center justify-center gap-2 text-xs font-semibold text-primary hover:underline"
            href="/discover"
          >
            <span>Explore full directory</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </ShongjogCard>

      {/* Discovery Hub Banner */}
      <ShongjogCard className="p-6 bg-gradient-to-br from-primary/5 via-card to-card border-primary/20">
        <div className="flex items-center gap-2 mb-2 text-primary font-bold text-sm">
          <Compass className="size-4" />
          <span>Smart Matching</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Discover alumni in tech hubs, student portfolio projects, and verified internship opportunities.
        </p>
        <Link
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
          href="/discover"
        >
          <span>Find by skill or company</span>
          <ArrowRight className="size-3" />
        </Link>
      </ShongjogCard>
    </aside>
  );
}
