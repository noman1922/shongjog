import { ExternalLink, FolderKanban } from "lucide-react";
import Link from "next/link";

import type { DiscoverProject } from "@/lib/discover/data";

export function DiscoveryProjectCard({ project }: { project: DiscoverProject }) {
  return (
    <article className="rounded-xl border border-[#BFC9C3] bg-white p-4 shadow-[0_4px_12px_rgba(30,41,59,0.04)]">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#ECEEEB] text-[#0F5A47]">
          <FolderKanban aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-bold text-[#191C1B]">{project.title}</h3>
          {project.authorUsername ? (
            <Link
              className="mt-1 block text-sm text-[#0F5A47] hover:underline"
              href={`/profile/${project.authorUsername}`}
            >
              {project.authorName ?? "View author"}
            </Link>
          ) : null}
          {project.description ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#3F4945]">
              {project.description}
            </p>
          ) : null}
          {project.projectUrl ? (
            <a
              className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#0F5A47] px-3 text-sm font-semibold text-[#0F5A47] hover:bg-[#0F5A47]/5"
              href={project.projectUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open project
              <ExternalLink aria-hidden="true" className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

