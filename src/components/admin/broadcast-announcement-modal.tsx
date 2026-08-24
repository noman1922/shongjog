"use client";

import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Info,
  Loader2,
  Megaphone,
  Radio,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useState, useTransition } from "react";

import { broadcastAnnouncementAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function BroadcastAnnouncementModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [bannerType, setBannerType] = useState<"info" | "warning" | "success" | "urgent">("info");
  const [targetAudience, setTargetAudience] = useState<"all" | "students" | "alumni">("all");
  const [feedback, setFeedback] = useState<{ error?: string; message?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await broadcastAnnouncementAction({
        bannerType,
        content: content.trim(),
        targetAudience,
        title: title.trim(),
      });

      if (res.error) {
        setFeedback({ error: res.error });
      } else {
        setFeedback({ message: res.message });
        setTimeout(() => {
          setTitle("");
          setContent("");
          setFeedback(null);
          onClose();
        }, 1500);
      }
    });
  };

  const bannerThemes = {
    info: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    urgent: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
    >
      <div className="fixed inset-0" onClick={() => !isPending && onClose()} />

      <div className="relative w-full max-w-xl rounded-3xl border border-border/80 dark:border-slate-800 bg-card shadow-2xl overflow-hidden p-6 z-10 space-y-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Megaphone className="size-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Broadcast Campus Announcement
              </h2>
              <p className="text-xs text-muted-foreground">
                Publish a platform-wide banner to student and alumni feeds
              </p>
            </div>
          </div>

          <button
            aria-label="Close modal"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Live Banner Preview
          </p>
          <div
            className={`rounded-2xl border p-3.5 flex items-start gap-3 transition-colors ${bannerThemes[bannerType]}`}
          >
            {bannerType === "urgent" ? (
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
            ) : bannerType === "warning" ? (
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
            ) : bannerType === "success" ? (
              <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
            ) : (
              <Info className="size-5 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-foreground">
                {title || "Announcement Headline"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {content || "Detailed announcement message and instructions will appear here."}
              </p>
              <span className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-wider bg-background/60 px-2 py-0.5 rounded-md text-foreground">
                Audience: {targetAudience.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Form Controls */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {feedback && (
            <div
              className={`rounded-xl p-3 text-xs font-medium ${
                feedback.error
                  ? "border border-destructive/30 bg-destructive/10 text-destructive"
                  : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {feedback.error || feedback.message}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Announcement Title <span className="text-destructive">*</span>
            </label>
            <input
              className="w-full rounded-xl border border-border/80 dark:border-slate-700 bg-muted/40 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Exam Schedule & Hackathon Registrations Open"
              required
              value={title}
            />
          </div>

          {/* Type & Audience Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Banner Style</label>
              <select
                className="w-full rounded-xl border border-border/80 dark:border-slate-700 bg-muted/40 dark:bg-slate-800/60 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                onChange={(e) => setBannerType(e.target.value as any)}
                value={bannerType}
              >
                <option value="info">🔵 Informational (Blue)</option>
                <option value="success">🟢 Success & Updates (Green)</option>
                <option value="warning">🟡 Notice & Advisory (Yellow)</option>
                <option value="urgent">🔴 Urgent Announcement (Red)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Target Audience</label>
              <select
                className="w-full rounded-xl border border-border/80 dark:border-slate-700 bg-muted/40 dark:bg-slate-800/60 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                onChange={(e) => setTargetAudience(e.target.value as any)}
                value={targetAudience}
              >
                <option value="all">🌐 All Platform Members (Students & Alumni)</option>
                <option value="students">🎓 Students Only</option>
                <option value="alumni">💼 Alumni & Mentors Only</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Announcement Message <span className="text-destructive">*</span>
            </label>
            <textarea
              className="min-h-24 w-full resize-none rounded-xl border border-border/80 dark:border-slate-700 bg-muted/40 dark:bg-slate-800/60 p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              maxLength={800}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide clear details, timelines, external links, or guidelines for the campus community..."
              required
              value={content}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60 dark:border-slate-800">
            <Button
              isDisabled={isPending}
              onClick={onClose}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="gap-2 bg-primary text-white"
              isDisabled={!title.trim() || !content.trim() || isPending}
              type="submit"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              <span>Broadcast Now</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
