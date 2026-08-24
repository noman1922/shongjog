import { Briefcase, Building2, CheckCircle2, XCircle } from "lucide-react";

import { AppShell } from "@/components/shongjog/app-shell";
import { ExperienceSection } from "@/components/profile/experience-section";
import { ProfileAbout } from "@/components/profile/profile-about";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProjectsSection } from "@/components/profile/projects-section";
import { SkillsSection } from "@/components/profile/skills-section";
import { ShongjogCard } from "@/components/shongjog/surface";
import type { PublicProfile, ViewerProfile } from "@/lib/profile/types";

export function ProfileView({
  connectionActions,
  messageAction,
  profile,
  shellProfile,
}: {
  connectionActions?: React.ReactNode;
  messageAction?: React.ReactNode;
  profile: PublicProfile;
  shellProfile?: ViewerProfile | PublicProfile;
}) {
  const content = (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <ProfileHeader
          connectionActions={connectionActions}
          messageAction={messageAction}
          profile={profile}
        />
        <ProfileAbout profile={profile} />
        <ProjectsSection projects={profile.projects} />
        {profile.details.role === "alumni" ? (
          <ExperienceSection experiences={profile.experiences} />
        ) : null}
      </div>

      <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
        {profile.details.role === "student" ? (
          <ProfileAboutStatus profile={profile} />
        ) : (
          <ProfileCompanyCard profile={profile} />
        )}
        <SkillsSection skills={profile.skills} />
      </aside>
    </div>
  );

  return (
    <AppShell active="Profile" profile={shellProfile ?? profile}>
      {content}
    </AppShell>
  );
}

function ProfileAboutStatus({ profile }: { profile: PublicProfile }) {
  if (profile.details.role !== "student") {
    return null;
  }

  return (
    <ShongjogCard className="p-6">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Internship Availability
      </p>
      <div className="mt-3 flex items-center gap-2">
        {profile.details.internshipAvailable ? (
          <>
            <CheckCircle2 className="size-5 text-emerald-500" />
            <h3 className="font-bold text-base text-foreground">
              Available for Internships
            </h3>
          </>
        ) : (
          <>
            <XCircle className="size-5 text-muted-foreground" />
            <h3 className="font-bold text-base text-foreground">
              Not Currently Seeking
            </h3>
          </>
        )}
      </div>
      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
        {profile.details.availabilityText ||
          "Student is building their profile and connecting with alumni."}
      </p>
    </ShongjogCard>
  );
}

function ProfileCompanyCard({ profile }: { profile: PublicProfile }) {
  if (profile.details.role !== "alumni") {
    return null;
  }

  return (
    <ShongjogCard className="p-6">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="size-4 text-primary" />
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Current Organization
        </p>
      </div>
      <h3 className="text-lg font-bold text-foreground">
        {profile.details.companyName || "Organization not added"}
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
        {profile.details.jobTitle || "Job title not added"}
      </p>
      {profile.details.experienceYears ? (
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <Briefcase className="size-3.5" />
          {profile.details.experienceYears} years experience
        </span>
      ) : null}
    </ShongjogCard>
  );
}
