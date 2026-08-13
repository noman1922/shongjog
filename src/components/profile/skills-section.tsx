import { ProfileSection } from "@/components/profile/profile-section";
import type { ProfileSkill } from "@/lib/profile/types";

export function SkillsSection({ skills }: { skills: ProfileSkill[] }) {
  return (
    <ProfileSection title="Skills">
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              className="rounded-full border border-[#BFC9C3]/70 bg-[#F1F5F9] px-3 py-1.5 text-sm font-medium text-[#1E293B]"
              key={skill.id}
            >
              {skill.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#747875]">No skills added yet.</p>
      )}
    </ProfileSection>
  );
}
