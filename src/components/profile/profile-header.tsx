"use client";

import {
  BriefcaseBusiness,
  Edit3,
  GraduationCap,
  LogOut,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useState, type ReactNode } from "react";

import { LogoutConfirmationModal } from "@/components/ui/logout-confirmation-modal";
import { SkillPill } from "@/components/shongjog/surface";
import { Button, LinkButton } from "@/components/ui/button";
import type { PublicProfile } from "@/lib/profile/types";
import { getInitials } from "@/lib/utils";

export function ProfileHeader({
  connectionActions,
  messageAction,
  profile,
}: {
  connectionActions?: ReactNode;
  messageAction?: ReactNode;
  profile: PublicProfile;
}) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const academicLine = [
    profile.details.departmentName,
    profile.details.universityName,
  ]
    .filter(Boolean)
    .join(", ");

  const isStudent = profile.details.role === "student";
  const subtitle =
    profile.details.role === "alumni"
      ? [profile.details.jobTitle, profile.details.companyName]
          .filter(Boolean)
          .join(" at ") || profile.details.professionalField
      : [profile.details.departmentName, profile.details.universityName]
          .filter(Boolean)
          .join(" • ");

  return (
    <header className="overflow-hidden rounded-[24px] border border-border/80 dark:border-slate-800 bg-card shadow-md">
      {/* Banner / Cover */}
      <div
        className={`h-36 sm:h-48 w-full relative ${
          isStudent
            ? "bg-gradient-to-r from-[#0050cb] via-blue-600 to-indigo-600"
            : "bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950"
        }`}
      >
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="relative p-5 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
            {/* Avatar */}
            <div className="-mt-16 sm:-mt-24 shrink-0 relative">
              <div className="size-24 sm:size-32 overflow-hidden rounded-full border-4 border-card bg-muted/60 shadow-lg ring-2 ring-primary/20">
                {profile.avatarUrl ? (
                  <Image
                    alt={profile.fullName ?? "Avatar"}
                    className="size-full rounded-full object-cover"
                    height={128}
                    priority
                    src={profile.avatarUrl}
                    width={128}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center rounded-full bg-primary/10 text-2xl sm:text-3xl font-bold text-primary">
                    {getInitials(profile.fullName)}
                  </div>
                )}
              </div>

              {/* Verified Shield Badge */}
              <span className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 flex size-7 sm:size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-white shadow">
                <ShieldCheck className="size-3.5 sm:size-4" />
              </span>
            </div>

            {/* Profile Info */}
            <div className="min-w-0 space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    isStudent
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                      : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                  }`}
                >
                  {isStudent ? (
                    <GraduationCap className="size-3.5" />
                  ) : (
                    <BriefcaseBusiness className="size-3.5" />
                  )}
                  {isStudent ? "Verified Student" : "Alumni Mentor"}
                </span>

                {profile.details.graduationYear ? (
                  <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                    Class of {profile.details.graduationYear}
                  </span>
                ) : null}
              </div>

              <div>
                <h1 className="break-words text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                  {profile.fullName}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  @{profile.username}
                </p>
              </div>

              {subtitle ? (
                <p className="break-words text-sm sm:text-base font-medium text-foreground/90 leading-relaxed">
                  {subtitle}
                </p>
              ) : null}

              {academicLine ? (
                <p className="flex items-start gap-1.5 text-xs sm:text-sm text-muted-foreground break-words leading-relaxed">
                  <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                  <span>{academicLine}</span>
                </p>
              ) : null}

              {profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.skills.slice(0, 4).map((skill) => (
                    <SkillPill key={skill.id}>{skill.name}</SkillPill>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Action Buttons */}
          {profile.isOwner ? (
            <div className="flex w-full flex-col gap-2.5 sm:w-auto shrink-0 pt-2">
              <LinkButton
                className="h-11 sm:h-10 w-full rounded-full border border-primary text-primary hover:bg-primary/10 sm:w-auto font-semibold px-5 justify-center"
                href="/profile/edit"
                variant="outline"
              >
                <Edit3 className="size-4" />
                <span>Edit Profile</span>
              </LinkButton>
              <LinkButton
                className="h-11 sm:h-10 w-full rounded-full border border-border bg-card text-foreground hover:bg-muted sm:w-auto font-semibold px-5 justify-center"
                href="/connections"
                variant="outline"
              >
                <Users className="size-4" />
                <span>My Circles</span>
              </LinkButton>
              <Button
                className="h-11 sm:h-10 w-full rounded-full text-destructive hover:bg-destructive/10 sm:w-auto font-semibold justify-center cursor-pointer"
                onClick={() => setShowLogoutModal(true)}
                type="button"
                variant="ghost"
              >
                <LogOut className="size-4" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-2.5 sm:w-auto shrink-0 pt-2">
              {connectionActions}
              {messageAction ?? (
                <Button
                  className="h-11 sm:h-10 w-full rounded-full border border-border bg-card text-foreground opacity-60 sm:w-auto justify-center"
                  isDisabled
                  type="button"
                  variant="outline"
                >
                  <MessageCircle className="size-4" />
                  <span>Message</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </header>
  );
}
