import { BriefcaseBusiness } from "lucide-react";

import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileSection } from "@/components/profile/profile-section";
import type { ProfileExperience } from "@/lib/profile/types";

function formatRange(experience: ProfileExperience) {
  const start = experience.startDate || "Start date not set";
  const end = experience.isCurrent ? "Present" : experience.endDate || "End date not set";
  return `${start} - ${end}`;
}

export function ExperienceSection({
  experiences,
}: {
  experiences: ProfileExperience[];
}) {
  return (
    <ProfileSection title="Work experience">
      {experiences.length > 0 ? (
        <div className="grid gap-4">
          {experiences.map((experience) => (
            <ProfileCard key={experience.id}>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#ECEEEB] text-[#0F5A47]">
                    <BriefcaseBusiness aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <h3 className="break-words font-semibold text-[#191C1B]">
                      {experience.position}
                    </h3>
                    <p className="text-sm text-[#3F4945]">
                    {experience.company}
                    </p>
                  </div>
                </div>
                <p className="text-xs font-medium uppercase text-[#747875]">
                  {formatRange(experience)}
                </p>
                {experience.description ? (
                  <p className="text-sm leading-6 text-[#3F4945]">
                    {experience.description}
                  </p>
                ) : null}
              </div>
            </ProfileCard>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#747875]">
          No professional experience added yet.
        </p>
      )}
    </ProfileSection>
  );
}
