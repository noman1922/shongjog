import { Image as ImageIcon, Lightbulb, Send } from "lucide-react";

import { createPostAction } from "@/app/dashboard/actions";
import { ShongjogCard } from "@/components/shongjog/surface";
import type { PublicProfile } from "@/lib/profile/types";

function initials(name: string | null) {
  return (
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S"
  );
}

function Avatar({ profile }: { profile: PublicProfile }) {
  if (profile.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" className="size-11 rounded-full object-cover" src={profile.avatarUrl} />;
  }

  return (
    <div className="flex size-11 items-center justify-center rounded-full bg-[#E6E9E5] text-sm font-semibold text-[#0F5A47]">
      {initials(profile.fullName)}
    </div>
  );
}

export function CreatePost({ profile }: { profile: PublicProfile }) {
  return (
    <ShongjogCard className="overflow-hidden">
      <form action={createPostAction} className="p-4 sm:p-5">
        <div className="flex gap-3">
          <Avatar profile={profile} />
          <label className="min-w-0 flex-1">
            <span className="sr-only">What do you want to share?</span>
            <textarea
              className="min-h-28 w-full resize-y rounded-xl border border-[#BFC9C3] bg-[#F8FAF7] px-4 py-3 text-sm leading-6 text-[#191C1B] outline-none transition placeholder:text-[#747875] focus:border-[#0F5A47] focus:ring-4 focus:ring-[#0F5A47]/15"
              maxLength={2800}
              name="content"
              placeholder="What do you want to share?"
              required
            />
          </label>
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-[#BFC9C3]/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2 text-sm text-[#3F4945]">
            <span className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3">
              <Lightbulb aria-hidden="true" className="size-4 text-[#14B8A6]" />
              Advice
            </span>
            <span className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-[#747875]">
              <ImageIcon aria-hidden="true" className="size-4" />
              Media later
            </span>
          </div>
          <button
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0F5A47] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B4939] sm:w-auto"
            type="submit"
          >
            <Send aria-hidden="true" className="size-4" />
            Post
          </button>
        </div>
      </form>
    </ShongjogCard>
  );
}
