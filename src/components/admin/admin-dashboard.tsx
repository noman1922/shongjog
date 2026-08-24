"use client";

import {
  Activity,
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Radio,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";

import { signOutAction } from "@/app/profile/actions";
import { AdminOverview } from "@/components/admin/admin-overview";
import { BroadcastAnnouncementModal } from "@/components/admin/broadcast-announcement-modal";
import { ContentModerationTab } from "@/components/admin/content-moderation-tab";
import { SystemActivityLog } from "@/components/admin/system-activity-log";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { ShongjogBrand } from "@/components/shongjog/brand";
import { ThemeToggle } from "@/components/shongjog/theme-toggle";
import { Button } from "@/components/ui/button";
import type {
  AdminDashboardData,
  AdminPostItem,
  AdminStoryItem,
  AdminUserSummary,
} from "@/lib/admin/data";
import type { AuthenticatedAdmin } from "@/lib/admin/permissions";

type TabKey = "overview" | "users" | "posts" | "logs";

export function AdminDashboard({
  admin,
  data,
  users,
  posts,
  stories = [],
}: {
  admin: AuthenticatedAdmin;
  data: AdminDashboardData;
  users: AdminUserSummary[];
  posts: AdminPostItem[];
  stories?: AdminStoryItem[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background text-foreground transition-colors duration-200">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 dark:border-slate-800 bg-card/80 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShongjogBrand href="/admin" variant="admin" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              className="gap-1.5 bg-primary text-white hover:bg-primary/90 text-xs font-bold rounded-xl shadow-xs"
              onClick={() => setIsBroadcastOpen(true)}
              size="sm"
              type="button"
            >
              <Megaphone className="size-3.5" />
              <span className="hidden sm:inline">Broadcast</span>
            </Button>

            <div className="hidden sm:flex flex-col text-right pr-1">
              <span className="text-xs font-bold text-foreground">{admin.fullName}</span>
              <span className="text-[11px] text-muted-foreground">{admin.email}</span>
            </div>

            <ThemeToggle />

            <form action={signOutAction}>
              <Button
                className="h-9 rounded-xl border border-border/80 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                size="sm"
                type="submit"
                variant="outline"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Admin Header Title Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/60 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Institutional Command Center
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Oversee campus network telemetry, university analytics, content moderation, and system broadcasts.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-4" />
            <span>Role Verified: System Admin</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto p-1 rounded-2xl bg-muted/60 dark:bg-slate-800/80 w-fit">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-card dark:bg-slate-700 text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("overview")}
            type="button"
          >
            <LayoutDashboard className="size-4" />
            <span>Overview & KPIs</span>
          </button>

          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-card dark:bg-slate-700 text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("users")}
            type="button"
          >
            <Users className="size-4" />
            <span>User Management</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.2 text-[11px] font-bold text-primary">
              {users.length}
            </span>
          </button>

          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "posts"
                ? "bg-card dark:bg-slate-700 text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("posts")}
            type="button"
          >
            <FileText className="size-4" />
            <span>Content Moderation</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.2 text-[11px] font-bold text-primary">
              {posts.length + stories.length}
            </span>
          </button>

          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "logs"
                ? "bg-card dark:bg-slate-700 text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("logs")}
            type="button"
          >
            <Activity className="size-4" />
            <span>Live Audit Logs</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.2 text-[11px] font-bold text-primary">
              {data.latestActivities?.length || 0}
            </span>
          </button>
        </div>

        {/* Tab Content Panes */}
        {activeTab === "overview" && (
          <AdminOverview
            data={data}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "users" && (
          <UserManagementTable
            currentAdminId={admin.id}
            users={users}
          />
        )}

        {activeTab === "posts" && (
          <ContentModerationTab
            posts={posts}
            stories={stories}
          />
        )}

        {activeTab === "logs" && (
          <SystemActivityLog activities={data.latestActivities || []} />
        )}
      </main>

      {/* Global Broadcast Modal */}
      <BroadcastAnnouncementModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
      />
    </div>
  );
}
