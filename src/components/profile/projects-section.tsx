import { Code2, ExternalLink, FolderKanban } from "lucide-react";

import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileSection } from "@/components/profile/profile-section";
import type { ProfileProject } from "@/lib/profile/types";

export function ProjectsSection({ projects }: { projects: ProfileProject[] }) {
  return (
    <ProfileSection title="Featured Projects & Research">
      {projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <ProfileCard key={project.id}>
              <div className="space-y-3">
                {project.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={project.title}
                    className="aspect-video w-full rounded-xl border border-border/60 object-cover"
                    src={project.imageUrl}
                  />
                ) : null}

                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FolderKanban className="size-4" />
                    </span>
                    <h3 className="break-words font-bold text-sm sm:text-base text-foreground leading-snug">
                      {project.title}
                    </h3>
                  </div>

                  {project.description ? (
                    <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {project.description}
                    </p>
                  ) : null}

                  {project.projectUrl ? (
                    <a
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-primary/30 dark:border-primary/50 bg-primary/5 dark:bg-primary/15 px-3.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                      href={project.projectUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Code2 className="size-3.5" />
                      <span>View Project</span>
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            </ProfileCard>
          ))}
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-muted-foreground">No projects added yet.</p>
      )}
    </ProfileSection>
  );
}
