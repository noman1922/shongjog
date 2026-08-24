"use client";

import { AlertCircle, CheckCircle2, Info, Megaphone, X } from "lucide-react";
import { useState } from "react";

import type { AdminAnnouncementItem } from "@/lib/admin/data";

export function AnnouncementBanner({
  announcement,
}: {
  announcement: AdminAnnouncementItem | null;
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!announcement || !isVisible) return null;

  const themes = {
    info: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    urgent: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };

  const currentTheme = themes[announcement.bannerType] || themes.info;

  return (
    <div
      className={`rounded-2xl border p-4 flex items-start justify-between gap-3 shadow-xs animate-in fade-in duration-200 ${currentTheme}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex size-8 items-center justify-center rounded-xl bg-background/60 text-foreground shrink-0 mt-0.5 shadow-xs">
          {announcement.bannerType === "urgent" || announcement.bannerType === "warning" ? (
            <AlertCircle className="size-4.5 text-amber-500" />
          ) : announcement.bannerType === "success" ? (
            <CheckCircle2 className="size-4.5 text-emerald-500" />
          ) : (
            <Megaphone className="size-4.5 text-primary" />
          )}
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Official Campus Announcement
            </span>
            <span className="text-[10px] font-semibold bg-background/70 px-2 py-0.2 rounded-full text-muted-foreground">
              {announcement.targetAudience === "all"
                ? "Campus-wide"
                : `${announcement.targetAudience.toUpperCase()} only`}
            </span>
          </div>
          <h4 className="text-sm font-bold text-foreground leading-snug">
            {announcement.title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {announcement.content}
          </p>
        </div>
      </div>

      <button
        aria-label="Dismiss announcement"
        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-background/80 hover:text-foreground transition-colors shrink-0 cursor-pointer"
        onClick={() => setIsVisible(false)}
        type="button"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
