"use client";

import {
  Compass,
  LogOut,
  Settings,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { LogoutConfirmationModal } from "@/components/ui/logout-confirmation-modal";
import { ShongjogCard } from "@/components/shongjog/surface";
import type { PublicProfile } from "@/lib/profile/types";
import { getInitials } from "@/lib/utils";

function profileCompletion(profile: PublicProfile) {
  if (!profile) return 0;
  const skillsCount = profile.skills?.length ?? 0;
  const projectsCount = profile.projects?.length ?? 0;
  const experiencesCount = profile.experiences?.length ?? 0;

  const checks = [
    Boolean(profile.fullName),
    Boolean(profile.username),
    Boolean(profile.bio),
    Boolean(profile.details?.universityName),
    Boolean(profile.details?.departmentName),
    Boolean(profile.details?.graduationYear),
    skillsCount > 0,
    projectsCount > 0,
  ];

  if (profile.details?.role === "student") {
    checks.push(Boolean(profile.details?.availabilityText));
  } else {
    checks.push(Boolean(profile.details?.companyName));
    checks.push(experiencesCount > 0);
  }

  const completed = checks.filter(Boolean).length;
  const total = Math.max(checks.length, 1);
  return Math.round((completed / total) * 100);
}

interface LeftProfileSidebarProps {
  className?: string;
  postCount: number;
  profile: PublicProfile;
}

export function LeftProfileSidebar({
  className = "",
  postCount,
  profile,
}: LeftProfileSidebarProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const completion = profileCompletion(profile);
  const isStudent = profile.details?.role === "student";

  const skillsCount = profile.skills?.length ?? 0;
  const projectsCount = profile.projects?.length ?? 0;
  const universityName = profile.details?.universityName ?? "University Network";
  const departmentName = profile.details?.departmentName ?? "";

  return (
    <aside className={`space-y-6 ${className}`}>
      {/* Profile Overview Card */}
      <ShongjogCard className="p-6 text-center">
        {/* Avatar & Identifiers */}
        <div className="flex flex-col items-center">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-full ring-4 ring-primary/20 shadow-sm">
            {profile.avatarUrl ? (
              <Image
                alt={profile.fullName ?? "Avatar"}
                className="size-full rounded-full object-cover"
                height={80}
                priority
                src={profile.avatarUrl}
                width={80}
              />
            ) : (
              <div className="flex size-full items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {getInitials(profile.fullName)}
              </div>
            )}
          </div>

          <h2 className="mt-3 truncate max-w-full font-bold text-lg text-foreground">
            {profile.fullName ?? "Shongjog member"}
          </h2>
          <p className="text-xs text-muted-foreground">
            @{profile.username ?? "member"}
          </p>
          <span
            className={`mt-2 inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${
              isStudent
                ? "bg-primary/10 text-primary"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {profile.details?.role ?? "student"}
          </span>
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {departmentName ? `${departmentName}, ` : ""}
            {universityName}
          </p>
        </div>

        {/* Stats Row */}
        <div className="my-5 grid grid-cols-3 divide-x divide-border/60 dark:divide-slate-800 border-y border-border/60 dark:border-slate-800 py-3 text-center">
          <div>
            <div className="font-bold text-base text-foreground">{postCount ?? 0}</div>
            <div className="text-[11px] text-muted-foreground">Posts</div>
          </div>
          <div>
            <div className="font-bold text-base text-foreground">
              {skillsCount}
            </div>
            <div className="text-[11px] text-muted-foreground">Skills</div>
          </div>
          <div>
            <div className="font-bold text-base text-foreground">
              {projectsCount}
            </div>
            <div className="text-[11px] text-muted-foreground">Projects</div>
          </div>
        </div>

        {/* Profile Strength Progress Bar */}
        <div className="text-left">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="size-3.5 text-primary" /> Profile Strength
            </span>
            <span>{completion}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {/* Navigation Quick Links */}
        <nav className="mt-6 flex flex-col gap-1 text-left border-t border-border/60 dark:border-slate-800 pt-4">
          <Link
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-primary bg-primary/10 dark:bg-primary/20 transition-colors"
            href="/profile"
          >
            <User className="size-4" />
            <span>My Profile</span>
          </Link>
          <Link
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted dark:hover:bg-slate-800 hover:text-foreground transition-all hover:translate-x-1"
            href="/connections"
          >
            <Users className="size-4" />
            <span>Circles</span>
          </Link>
          <Link
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted dark:hover:bg-slate-800 hover:text-foreground transition-all hover:translate-x-1"
            href="/discover"
          >
            <Compass className="size-4" />
            <span>Discover</span>
          </Link>
          <Link
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted dark:hover:bg-slate-800 hover:text-foreground transition-all hover:translate-x-1"
            href="/profile/edit"
          >
            <Settings className="size-4" />
            <span>Settings & Photo</span>
          </Link>
          <button
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors mt-1 cursor-pointer"
            onClick={() => setShowLogoutModal(true)}
            type="button"
          >
            <LogOut className="size-4" />
            <span>Log Out</span>
          </button>
        </nav>
      </ShongjogCard>

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />

      {/* Trending Topics Widget */}
      <ShongjogCard className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="size-5 text-primary" />
          <h3 className="font-bold text-base text-foreground">Trending Topics</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Popular conversations across universities
        </p>
        <div className="space-y-3.5">
          <Link className="block group" href="/discover?q=Startup">
            <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
              #FromIdeaToStartup: Tips for aspiring student founders
            </p>
            <span className="text-[10px] text-muted-foreground">1.8k posts</span>
          </Link>
          <Link className="block group" href="/discover?q=AI">
            <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
              #AIResearch: Machine learning breakthroughs in Bangladesh
            </p>
            <span className="text-[10px] text-muted-foreground">2.4k posts</span>
          </Link>
          <Link className="block group" href="/discover?q=Internship">
            <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
              #SummerInternships: Alumni hiring guides & referrals
            </p>
            <span className="text-[10px] text-muted-foreground">950 posts</span>
          </Link>
        </div>
      </ShongjogCard>
    </aside>
  );
}
