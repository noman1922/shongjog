import { AppShell } from "@/components/shongjog/app-shell";
import { ExperienceSection } from "@/components/profile/experience-section";
import { ProfileAbout } from "@/components/profile/profile-about";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProjectsSection } from "@/components/profile/projects-section";
import { SkillsSection } from "@/components/profile/skills-section";
import type { PublicProfile } from "@/lib/profile/types";

export function ProfileView({
  connectionActions,
  messageAction,
  profile,
  shellProfile,
}: {
  connectionActions?: React.ReactNode;
  messageAction?: React.ReactNode;
  profile: PublicProfile;
  shellProfile?: PublicProfile;
}) {
  const content = (
    <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 pb-24 pt-6 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pb-8">
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
      <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
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
    <section className="rounded-xl border border-[#BFC9C3] bg-white p-5 shadow-[0_4px_12px_rgba(30,41,59,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#747875]">
        Current status
      </p>
      <h2 className="mt-3 text-lg font-bold text-[#191C1B]">
        {profile.details.internshipAvailable
          ? "Available for Internship"
          : "Not available for internship"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#3F4945]">
        {profile.details.availabilityText ||
          "Availability details have not been added yet."}
      </p>
    </section>
  );
}

function ProfileCompanyCard({ profile }: { profile: PublicProfile }) {
  if (profile.details.role !== "alumni") {
    return null;
  }

  return (
    <section className="rounded-xl border border-[#BFC9C3] bg-white p-5 shadow-[0_4px_12px_rgba(30,41,59,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#747875]">
        Current company
      </p>
      <h2 className="mt-3 text-lg font-bold text-[#191C1B]">
        {profile.details.companyName || "Company not added"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#3F4945]">
        {profile.details.jobTitle || "Job title not added"}
      </p>
      <p className="mt-3 rounded-full bg-[#ACF1D7] px-3 py-1 text-sm font-semibold text-[#00513F]">
        {profile.details.experienceYears ?? 0} years experience
      </p>
    </section>
  );
}
