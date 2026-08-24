import { Compass, PenLine } from "lucide-react";
import Link from "next/link";

import { CreatePost } from "@/components/feed/create-post";
import { FeedPostCard } from "@/components/feed/feed-post-card";
import { ShongjogCard } from "@/components/shongjog/surface";
import type { HomeFeedData } from "@/lib/feed/data";
import type { PublicProfile } from "@/lib/profile/types";

function EmptyFeed() {
  return (
    <ShongjogCard className="p-8 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <PenLine className="size-7" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-foreground">
        Your network feed is quiet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Connect with students and alumni from your university to discover projects, updates, and opportunities.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-all"
          href="/discover"
        >
          <Compass className="size-4" />
          Discover People
        </Link>
        <a
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border/80 dark:border-slate-700 bg-card px-6 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          href="#create-post"
        >
          Create First Post
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
  const posts = (data?.posts ?? []).filter(Boolean);

  return (
    <div className="space-y-6">
      <div id="create-post">
        <CreatePost profile={profile} />
      </div>

      {posts.length > 0 ? (
        posts.map((post) => <FeedPostCard key={post.id} post={post} />)
      ) : (
        <EmptyFeed />
      )}

      {data.nextCursor ? (
        <div className="flex justify-center pt-2">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border/80 dark:border-slate-700 bg-card px-6 text-sm font-semibold text-foreground shadow-sm hover:bg-muted dark:hover:bg-slate-800 transition-colors"
            href={`/dashboard?cursor=${encodeURIComponent(data.nextCursor)}`}
          >
            Load more posts
          </Link>
        </div>
      ) : null}
    </div>
  );
}
