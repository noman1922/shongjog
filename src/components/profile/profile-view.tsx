import { ExperienceSection } from "@/components/profile/experience-section";
import { ProfileAbout } from "@/components/profile/profile-about";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProjectsSection } from "@/components/profile/projects-section";
import { SkillsSection } from "@/components/profile/skills-section";
import type { PublicProfile } from "@/lib/profile/types";

export function ProfileView({ profile }: { profile: PublicProfile }) {
  return (
    <main className="min-h-dvh bg-muted/30 px-4 py-5 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <ProfileHeader profile={profile} />
          <ProfileAbout profile={profile} />
          <ProjectsSection projects={profile.projects} />
          {profile.details.role === "alumni" ? (
            <ExperienceSection experiences={profile.experiences} />
          ) : null}
        </div>
        <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
          <SkillsSection skills={profile.skills} />
        </aside>
      </div>
    </main>
  );
}
