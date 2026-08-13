import { Compass, PenLine } from "lucide-react";
import Link from "next/link";

import { CreatePost } from "@/components/feed/create-post";
import { FeedPostCard } from "@/components/feed/feed-post-card";
import { ShongjogCard } from "@/components/shongjog/surface";
import type { HomeFeedData } from "@/lib/feed/data";
import type { PublicProfile } from "@/lib/profile/types";

function EmptyFeed() {
  return (
    <ShongjogCard className="p-6 text-center sm:p-8">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#E1F7EE] text-[#0F5A47]">
        <PenLine aria-hidden="true" className="size-6" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-[#191C1B]">
        Your network is quiet.
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#3F4945]">
        Follow people, join your Circle, and start sharing to build your feed.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0F5A47] px-5 text-sm font-semibold text-white hover:bg-[#0B4939]"
          href="/discover"
        >
          <Compass aria-hidden="true" className="size-4" />
          Discover people
        </Link>
        <a
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#0F5A47] px-5 text-sm font-semibold text-[#0F5A47] hover:bg-[#0F5A47]/5"
          href="#create-post"
        >
          Create a post
        </a>
      </div>
    </ShongjogCard>
  );
}

export function FeedList({
  data,
  profile,
}: {
  data: HomeFeedData;
  profile: PublicProfile;
}) {
  return (
    <div className="space-y-5">
      <div id="create-post">
        <CreatePost profile={profile} />
      </div>
      {data.posts.length > 0 ? (
        data.posts.map((post) => <FeedPostCard key={post.id} post={post} />)
      ) : (
        <EmptyFeed />
      )}
      {data.nextCursor ? (
        <div className="flex justify-center">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#BFC9C3] bg-white px-5 text-sm font-semibold text-[#1E293B] hover:bg-[#F2F4F1]"
            href={`/dashboard?cursor=${encodeURIComponent(data.nextCursor)}`}
          >
            Load more
          </Link>
        </div>
      ) : null}
    </div>
  );
}
