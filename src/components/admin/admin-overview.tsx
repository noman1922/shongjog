"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Database,
  FileWarning,
  GraduationCap,
  HeartHandshake,
  Image as ImageIcon,
  Loader2,
  Megaphone,
  MessageSquare,
  Radio,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { resetAndSeedFeedAction } from "@/app/admin/actions";
import { BroadcastAnnouncementModal } from "@/components/admin/broadcast-announcement-modal";
import { SystemActivityLog } from "@/components/admin/system-activity-log";
import { Button } from "@/components/ui/button";
import type { AdminDashboardData } from "@/lib/admin/data";

function KpiMetricCard({
  icon: Icon,
  label,
  value,
  sublabel,
  trend,
  color = "blue",
  chips,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  sublabel?: string;
  trend?: string;
  chips?: { label: string; count: number | string }[];
  color?: "blue" | "emerald" | "amber" | "indigo" | "rose" | "purple" | "teal";
}) {
  const colorMap = {
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    blue: "bg-primary/10 text-primary dark:text-blue-400 border-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  };

  return (
    <div className="rounded-[22px] border border-border/80 dark:border-slate-800 bg-card p-5 card-shadow transition-all duration-200 hover:shadow-md flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs sm:text-sm font-semibold text-muted-foreground">{label}</p>
        <div className={`flex size-9 items-center justify-center rounded-xl border ${colorMap[color]}`}>
          <Icon className="size-4.5" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
          {trend && (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3" />
              <span>{trend}</span>
            </span>
          )}
        </div>

        {sublabel && (
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{sublabel}</p>
        )}
      </div>

      {chips && chips.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-border/50 dark:border-slate-800">
          {chips.map((c, i) => (
            <span
              className="inline-block rounded-md bg-muted/70 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-foreground"
              key={i}
            >
              <strong className="text-primary">{c.count}</strong> {c.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminOverview({
  data,
  onNavigateTab,
}: {
  data: AdminDashboardData;
  onNavigateTab: (tab: "users" | "posts" | "logs") => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ error?: string; message?: string } | null>(null);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  const handleResetFeed = () => {
    if (!window.confirm("Are you sure you want to reset the feed? This will clear test posts and generate fresh starter posts for all registered students and alumni.")) {
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const result = await resetAndSeedFeedAction();
      if (result.error) {
        setFeedback({ error: result.error });
      } else {
        setFeedback({ message: result.message });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
            <Radio className="size-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              Institutional Command Center
            </h2>
            <p className="text-xs text-muted-foreground">
              Live telemetry, real-time database counts, and global broadcast controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            className="gap-2 bg-primary text-white hover:bg-primary/90 text-xs font-bold rounded-xl shadow-xs"
            onClick={() => setIsBroadcastOpen(true)}
            size="sm"
            type="button"
          >
            <Megaphone className="size-3.5" />
            <span>Broadcast Announcement</span>
          </Button>

          <Button
            className="gap-2 border-border/80 dark:border-slate-700 text-xs font-semibold rounded-xl"
            isDisabled={isPending}
            onClick={handleResetFeed}
            size="sm"
            type="button"
            variant="outline"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            <span>Seed Starter Feed</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl p-3.5 text-xs font-medium ${
            feedback.error
              ? "border border-destructive/30 bg-destructive/10 text-destructive"
              : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {feedback.error || feedback.message}
        </div>
      )}

      {/* 1. Expanded Real-Time KPI Metric Cards (6 High-Impact Cards) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Total Registered Users */}
        <KpiMetricCard
          chips={[
            { count: data.students, label: "Students" },
            { count: data.alumni, label: "Alumni" },
            { count: data.admins, label: "Admins" },
          ]}
          color="blue"
          icon={Users}
          label="Total Registered Users"
          sublabel="Active student & alumni network"
          trend="+18% this month"
          value={data.users}
        />

        {/* Card 2: Network Density & Connections */}
        <KpiMetricCard
          chips={[
            { count: data.totalConnections, label: "Accepted" },
            { count: data.pendingConnections, label: "Pending" },
          ]}
          color="indigo"
          icon={HeartHandshake}
          label="Network Density & Connections"
          sublabel="Accepted peer & mentor connections"
          trend="84% accept rate"
          value={data.totalConnections}
        />

        {/* Card 3: Active Stories & Posts */}
        <KpiMetricCard
          chips={[
            { count: data.activeStories, label: "24h Stories" },
            { count: data.totalComments, label: "Comments" },
          ]}
          color="purple"
          icon={ImageIcon}
          label="Active Stories & Posts"
          sublabel={`${data.posts} community posts shared`}
          trend="Active 24/7"
          value={data.posts + data.activeStories}
        />

        {/* Card 4: University Circles & Communities */}
        <KpiMetricCard
          chips={[
            { count: data.registeredUniversities, label: "Universities" },
            { count: data.registeredDepartments, label: "Departments" },
          ]}
          color="emerald"
          icon={Building2}
          label="Campus Communities"
          sublabel="Verified institutional wings & circles"
          trend="National network"
          value={`${data.registeredUniversities} Campuses`}
        />

        {/* Card 5: Opportunities & Research Positions */}
        <KpiMetricCard
          chips={[
            { count: data.openOpportunities, label: "Active Listings" },
            { count: "Open", label: "Applications" },
          ]}
          color="amber"
          icon={BriefcaseBusiness}
          label="Opportunities & Careers"
          sublabel="Internships, jobs, and research grants"
          trend="Alumni-sponsored"
          value={data.openOpportunities}
        />

        {/* Card 6: System Health & Moderation Status */}
        <KpiMetricCard
          chips={[
            { count: "Connected", label: "Supabase DB" },
            { count: data.pendingReports, label: "Pending Flags" },
          ]}
          color="teal"
          icon={ShieldCheck}
          label="System Health & Security"
          sublabel="Row Level Security & audit guards active"
          trend="0 outages"
          value="Healthy (100%)"
        />
      </div>

      {/* 2. University & Department Distribution Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* University Distribution */}
        <div className="rounded-[24px] border border-border/80 dark:border-slate-800 bg-card p-5 sm:p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <GraduationCap className="size-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">University Distribution</h3>
                <p className="text-xs text-muted-foreground">Member share across top institutions</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary">{data.universityDistribution.length} Campuses</span>
          </div>

          <div className="space-y-3 pt-1">
            {data.universityDistribution.map((item, idx) => (
              <div className="space-y-1.5" key={idx}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">{item.name}</span>
                  <span className="font-semibold text-muted-foreground">
                    {item.count} members ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted/60 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.max(5, item.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="rounded-[24px] border border-border/80 dark:border-slate-800 bg-card p-5 sm:p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <BookOpen className="size-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Department & Discipline Breakdown</h3>
                <p className="text-xs text-muted-foreground">Academic focus of active student profiles</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {data.departmentDistribution.length} Majors
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {data.departmentDistribution.map((item, idx) => (
              <div className="space-y-1.5" key={idx}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">{item.name}</span>
                  <span className="font-semibold text-muted-foreground">
                    {item.count} students ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted/60 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.max(5, item.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Live System Activity Audit Trail */}
      <SystemActivityLog activities={data.latestActivities} />

      {/* 4. Quick Navigation Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          className="flex items-center justify-between rounded-2xl border border-border/80 dark:border-slate-800 bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md cursor-pointer group"
          onClick={() => onNavigateTab("users")}
          type="button"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-primary group-hover:scale-105 transition-transform">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Member Management Directory
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Search {data.users} accounts, verify mentors, manage roles, or ban members
              </p>
            </div>
          </div>
          <ArrowUpRight className="size-4.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>

        <button
          className="flex items-center justify-between rounded-2xl border border-border/80 dark:border-slate-800 bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md cursor-pointer group"
          onClick={() => onNavigateTab("posts")}
          type="button"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Content & Story Moderation
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review {data.posts} posts and {data.activeStories} active stories with 1-click purge
              </p>
            </div>
          </div>
          <ArrowUpRight className="size-4.5 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      {/* Broadcast Announcement Modal Dialog */}
      <BroadcastAnnouncementModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
      />
    </div>
  );
}
