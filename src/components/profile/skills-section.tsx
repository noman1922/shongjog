import { ProfileSection } from "@/components/profile/profile-section";
import { SkillPill } from "@/components/shongjog/surface";
import type { ProfileSkill } from "@/lib/profile/types";

export function SkillsSection({ skills }: { skills: ProfileSkill[] }) {
  return (
    <ProfileSection title="Skills & Expertise">
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <SkillPill key={skill.id}>{skill.name}</SkillPill>
          ))}
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-muted-foreground">No skills added yet.</p>
      )}
    </ProfileSection>
  );
}
