import { BriefcaseBusiness, Calendar } from "lucide-react";

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
    <ProfileSection title="Work Experience">
      {experiences.length > 0 ? (
        <div className="grid gap-3.5">
          {experiences.map((experience) => (
            <ProfileCard key={experience.id}>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BriefcaseBusiness className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-bold text-sm sm:text-base text-foreground">
                      {experience.position}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {experience.company}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] font-medium text-primary mt-1">
                      <Calendar className="size-3" />
                      {formatRange(experience)}
                    </p>
                  </div>
                </div>

                {experience.description ? (
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground pt-1">
                    {experience.description}
                  </p>
                ) : null}
              </div>
            </ProfileCard>
          ))}
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-muted-foreground">
          No professional experience added yet.
        </p>
      )}
    </ProfileSection>
  );
}
