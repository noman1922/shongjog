import { ProfileSection } from "@/components/profile/profile-section";
import type { ProfileSkill } from "@/lib/profile/types";

export function SkillsSection({ skills }: { skills: ProfileSkill[] }) {
  return (
    <ProfileSection title="Skills">
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              className="rounded-md border border-border bg-muted px-2.5 py-1 text-sm"
              key={skill.id}
            >
              {skill.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No skills added yet.</p>
      )}
    </ProfileSection>
  );
}
