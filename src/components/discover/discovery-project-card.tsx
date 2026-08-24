import { ExternalLink, FolderKanban } from "lucide-react";
import Link from "next/link";

import { ShongjogCard } from "@/components/shongjog/surface";
import type { DiscoverProject } from "@/lib/discover/data";

export function DiscoveryProjectCard({ project }: { project: DiscoverProject }) {
  return (
    <ShongjogCard className="p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FolderKanban className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-bold text-sm sm:text-base text-foreground leading-snug">
            {project.title}
          </h3>
          {project.authorUsername ? (
            <Link
              className="mt-1 block text-xs font-semibold text-primary hover:underline"
              href={`/profile/${project.authorUsername}`}
            >
              by {project.authorName ?? "member"}
            </Link>
          ) : null}

          {project.description ? (
            <p className="mt-2.5 line-clamp-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          ) : null}

          {project.projectUrl ? (
            <a
              className="mt-3.5 inline-flex min-h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 dark:bg-primary/15 px-3.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
              href={project.projectUrl}
              rel="noreferrer"
              target="_blank"
            >
              <span>View Project</span>
              <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </ShongjogCard>
  );
}
