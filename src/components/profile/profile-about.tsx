import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Layers,
  School,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { ComponentType } from "react";

import { ProfileSection } from "@/components/profile/profile-section";
import type { PublicProfile } from "@/lib/profile/types";

function DetailItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string | null | undefined;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
}) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="space-y-1 rounded-2xl border border-border/70 dark:border-slate-800 bg-muted/40 dark:bg-slate-800/40 p-3.5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {Icon ? <Icon className="size-4 text-primary shrink-0" /> : null}
        <span className="break-words leading-snug min-w-0">{value}</span>
      </p>
    </div>
  );
}

export function ProfileAbout({ profile }: { profile: PublicProfile }) {
  const { details } = profile;
  const isStudent = details.role === "student";

  return (
    <ProfileSection title="About & Background">
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-foreground/90">
          {profile.bio || "No professional summary added yet."}
        </p>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            icon={School}
            label="University"
            value={details.universityName}
          />
          <DetailItem
            icon={Building2}
            label="Department"
            value={details.departmentName}
          />
          <DetailItem
            icon={CalendarDays}
            label="Graduation Year"
            value={details.graduationYear}
          />

          {details.role === "student" ? (
            <>
              <div className="space-y-1 rounded-2xl border border-border/70 dark:border-slate-800 bg-muted/40 dark:bg-slate-800/40 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Internship Status
                </p>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  {details.internshipAvailable ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Available</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Not looking</span>
                    </>
                  )}
                </p>
              </div>
              <DetailItem
                label="Availability Info"
                value={details.availabilityText}
              />
            </>
          ) : (
            <>
              <DetailItem
                icon={Building2}
                label="Company"
                value={details.companyName}
              />
              <DetailItem
                icon={BriefcaseBusiness}
                label="Job Title"
                value={details.jobTitle}
              />
              <DetailItem
                icon={Layers}
                label="Professional Field"
                value={details.professionalField}
              />
              <DetailItem
                label="Experience"
                value={
                  details.experienceYears !== null &&
                  details.experienceYears !== undefined
                    ? `${details.experienceYears} years`
                    : null
                }
              />
            </>
          )}

          <div className="space-y-1 rounded-2xl border border-border/70 dark:border-slate-800 bg-muted/40 dark:bg-slate-800/40 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Member Category
            </p>
            <p className="flex items-center gap-2 text-sm font-semibold capitalize text-foreground">
              {isStudent ? (
                <GraduationCap className="size-4 text-primary" />
              ) : (
                <BriefcaseBusiness className="size-4 text-primary" />
              )}
              {details.role}
            </p>
          </div>
        </div>
      </div>
    </ProfileSection>
  );
}
