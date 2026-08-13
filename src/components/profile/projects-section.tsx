import { Code2, ExternalLink, FolderKanban } from "lucide-react";

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
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#ECEEEB] text-[#0F5A47]">
                      <FolderKanban aria-hidden="true" className="size-5" />
                    </span>
                    <h3 className="break-words font-semibold text-[#191C1B]">
                      {project.title}
                    </h3>
                  </div>
                  {project.description ? (
                    <p className="text-sm leading-6 text-[#3F4945]">
                      {project.description}
                    </p>
                  ) : null}
                  {project.projectUrl ? (
                    <a
                      className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#0F5A47] px-3 text-sm font-semibold text-[#0F5A47] underline-offset-4 hover:bg-[#0F5A47]/5"
                      href={project.projectUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Code2 className="size-4" aria-hidden="true" />
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
        <p className="text-sm text-[#747875]">No projects added yet.</p>
      )}
    </ProfileSection>
  );
}
