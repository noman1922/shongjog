import { ExternalLink } from "lucide-react";

import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileSection } from "@/components/profile/profile-section";
import type { ProfileProject } from "@/lib/profile/types";

export function ProjectsSection({ projects }: { projects: ProfileProject[] }) {
  return (
    <ProfileSection title="Projects">
      {projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProfileCard key={project.id}>
              <div className="space-y-3">
                {project.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    className="aspect-video w-full rounded-md border border-border object-cover"
                    src={project.imageUrl}
                  />
                ) : null}
                <div className="space-y-2">
                  <h3 className="break-words font-semibold">{project.title}</h3>
                  {project.description ? (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {project.description}
                    </p>
                  ) : null}
                  {project.projectUrl ? (
                    <a
                      className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                      href={project.projectUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View project
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </div>
            </ProfileCard>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No projects added yet.</p>
      )}
    </ProfileSection>
  );
}
