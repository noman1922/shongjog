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
                <div>
                  <h3 className="break-words font-semibold">{experience.position}</h3>
                  <p className="text-sm text-muted-foreground">
                    {experience.company}
                  </p>
                </div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  {formatRange(experience)}
                </p>
                {experience.description ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {experience.description}
                  </p>
                ) : null}
              </div>
            </ProfileCard>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No professional experience added yet.
        </p>
      )}
    </ProfileSection>
  );
}
