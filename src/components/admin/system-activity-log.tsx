"use client";

import {
  Activity,
  Award,
  CheckCircle2,
  Clock,
  Filter,
  Image as ImageIcon,
  KeyRound,
  MessageSquare,
  Radio,
  Search,
  ShieldAlert,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import type { AdminActivityItem } from "@/lib/admin/data";
import { getInitials } from "@/lib/utils";

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "Recent";
  }
}

export function SystemActivityLog({
  activities,
}: {
  activities: AdminActivityItem[];
}) {
  const [filterType, setFilterType] = useState<
    "all" | "auth" | "connection" | "story" | "post"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesType = filterType === "all" || act.type === filterType;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        act.title.toLowerCase().includes(term) ||
        act.description.toLowerCase().includes(term);

      return matchesType && matchesSearch;
    });
  }, [activities, filterType, searchTerm]);

  const typeIcons = {
    auth: UserPlus,
    connection: Users,
    moderation: ShieldAlert,
    opportunity: Award,
    post: MessageSquare,
    story: ImageIcon,
  };

  return (
    <div className="rounded-[24px] border border-border/80 dark:border-slate-800 bg-card p-5 sm:p-6 card-shadow space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Activity className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Live System Activity & Audit Trail
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time platform interaction telemetry and member lifecycle logs
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-muted/40 dark:bg-slate-800/60 text-xs">
          {(["all", "auth", "connection", "story", "post"] as const).map((t) => (
            <button
              className={`px-2.5 py-1 rounded-lg font-medium transition-all capitalize cursor-pointer ${
                filterType === t
                  ? "bg-card dark:bg-slate-700 text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              key={t}
              onClick={() => setFilterType(t)}
              type="button"
            >
              {t === "auth" ? "Accounts" : t === "connection" ? "Connections" : t === "story" ? "Stories" : t === "post" ? "Posts" : "All Events"}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List Stream */}
      <div className="space-y-3 pt-1">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((item) => {
            const Icon = typeIcons[item.type] || Activity;

            return (
              <div
                className="flex items-start justify-between gap-3.5 p-3.5 rounded-2xl border border-border/60 dark:border-slate-800 bg-muted/20 dark:bg-slate-800/30 hover:bg-muted/40 transition-colors"
                key={item.id}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Avatar / Icon */}
                  {item.authorAvatarUrl ? (
                    <div className="relative size-9 rounded-full overflow-hidden shrink-0 ring-1 ring-border/80 mt-0.5">
                      <Image
                        alt={item.title}
                        className="size-full object-cover"
                        height={36}
                        src={item.authorAvatarUrl}
                        width={36}
                      />
                    </div>
                  ) : (
                    <div className="flex size-9 items-center justify-center rounded-xl bg-muted/80 dark:bg-slate-700 text-foreground shrink-0 mt-0.5">
                      <Icon className="size-4 text-primary" />
                    </div>
                  )}

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                        {item.title}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.2 text-[10px] font-semibold rounded-full border ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed break-words">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap shrink-0 mt-1">
                  <Clock className="size-3" />
                  <span>{formatRelativeTime(item.timestamp)}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Activity className="size-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-xs font-semibold text-foreground">No recent activity found</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Live audit events matching your filter will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
