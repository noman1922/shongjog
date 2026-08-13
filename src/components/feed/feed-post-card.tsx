import {
  Ellipsis,
  MessageCircle,
  Send,
  Share2,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import {
  addCommentAction,
  deleteOwnPostAction,
  togglePostLikeAction,
} from "@/app/dashboard/actions";
import { ShongjogCard } from "@/components/shongjog/surface";
import type { FeedPost } from "@/lib/feed/data";
import { cn } from "@/lib/utils";

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

function formatTimestamp(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d`;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  }).format(date);
}

function Avatar({
  image,
  name,
}: {
  image: string | null;
  name: string | null;
}) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" className="size-12 rounded-full object-cover" src={image} />;
  }

  return (
    <div className="flex size-12 items-center justify-center rounded-full bg-[#E6E9E5] text-sm font-semibold text-[#0F5A47]">
      {initials(name)}
    </div>
  );
}

function AuthorLink({ post }: { post: FeedPost }) {
  const href = post.author.username ? `/profile/${post.author.username}` : "/profile";

  return (
    <Link
      className="group flex min-w-0 items-start gap-3"
      href={href}
    >
      <Avatar image={post.author.avatarUrl} name={post.author.fullName} />
      <span className="min-w-0">
        <span className="block truncate font-semibold text-[#191C1B] group-hover:text-[#0F5A47]">
          {post.author.fullName ?? "Shongjog member"}
        </span>
        <span className="mt-0.5 block truncate text-xs text-[#747875]">
          @{post.author.username ?? "member"} - {post.author.roleLine}
        </span>
        <span className="mt-0.5 block truncate text-xs text-[#3F4945]">
          {post.author.universityName ?? "Shongjog network"}
        </span>
      </span>
    </Link>
  );
}

function MediaPreview({ post }: { post: FeedPost }) {
  if (post.media.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 grid gap-2 overflow-hidden rounded-xl border border-[#BFC9C3]/70 bg-[#F8FAF7]">
      {post.media.slice(0, 4).map((media) =>
        media.mediaType.startsWith("image") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="max-h-[420px] w-full object-cover"
            key={media.id}
            src={media.mediaUrl}
          />
        ) : (
          <Link
            className="block px-4 py-3 text-sm font-semibold text-[#0F5A47] hover:underline"
            href={media.mediaUrl}
            key={media.id}
          >
            Open attached media
          </Link>
        )
      )}
    </div>
  );
}

function PostMenu({ post }: { post: FeedPost }) {
  return (
    <details className="relative">
      <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-full text-[#747875] hover:bg-[#ECEEEB]">
        <span className="sr-only">Post menu</span>
        <Ellipsis aria-hidden="true" className="size-5" />
      </summary>
      <div className="absolute right-0 top-10 z-10 min-w-44 rounded-xl border border-[#BFC9C3] bg-white p-2 shadow-lg">
        {post.isOwnPost ? (
          <form action={deleteOwnPostAction}>
            <input name="postId" type="hidden" value={post.id} />
            <button
              className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-red-700 hover:bg-red-50"
              type="submit"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Delete post
            </button>
          </form>
        ) : (
          <p className="px-3 py-2 text-sm text-[#747875]">No actions available</p>
        )}
      </div>
    </details>
  );
}

export function FeedPostCard({ post }: { post: FeedPost }) {
  return (
    <ShongjogCard className="overflow-hidden p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <AuthorLink post={post} />
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full bg-[#F1F5F9] px-2.5 py-1 text-xs font-medium capitalize text-[#1E293B] sm:inline-flex">
            {post.author.role}
          </span>
          <PostMenu post={post} />
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-[#191C1B] sm:text-[15px]">
        {post.content}
      </p>
      <MediaPreview post={post} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#BFC9C3]/60 pt-3 text-xs text-[#747875]">
        <span>{formatTimestamp(post.createdAt)}</span>
        <span>
          {post.reactionCount} likes - {post.commentCount} comments
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#BFC9C3]/60 pt-3 text-sm font-semibold text-[#3F4945]">
        <form action={togglePostLikeAction}>
          <input name="postId" type="hidden" value={post.id} />
          <button
            className={cn(
              "flex min-h-11 w-full items-center justify-center gap-2 rounded-lg hover:bg-[#ECEEEB]",
              post.viewerHasLiked && "bg-[#E1F7EE] text-[#0F5A47]"
            )}
            type="submit"
          >
            <ThumbsUp aria-hidden="true" className="size-4" />
            Like
          </button>
        </form>
        <a
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg hover:bg-[#ECEEEB]"
          href={`#comment-${post.id}`}
        >
          <MessageCircle aria-hidden="true" className="size-4" />
          Comment
        </a>
        <button
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg text-[#747875]"
          disabled
          type="button"
        >
          <Share2 aria-hidden="true" className="size-4" />
          Share
        </button>
      </div>

      {post.comments.length > 0 ? (
        <div className="mt-4 space-y-3 border-t border-[#BFC9C3]/60 pt-4">
          {post.comments.map((comment) => {
            const commentHref = comment.authorUsername
              ? `/profile/${comment.authorUsername}`
              : "/profile";

            return (
              <article className="flex gap-3" key={comment.id}>
                <Link href={commentHref}>
                  <Avatar image={comment.authorAvatarUrl} name={comment.authorName} />
                </Link>
                <div className="min-w-0 flex-1 rounded-xl bg-[#F8FAF7] px-3 py-2">
                  <Link
                    className="text-sm font-semibold text-[#191C1B] hover:text-[#0F5A47]"
                    href={commentHref}
                  >
                    {comment.authorName ?? "Shongjog member"}
                  </Link>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#3F4945]">
                    {comment.content}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      <form
        action={addCommentAction}
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        id={`comment-${post.id}`}
      >
        <input name="postId" type="hidden" value={post.id} />
        <label className="min-w-0 flex-1">
          <span className="sr-only">Add a comment</span>
          <input
            className="min-h-11 w-full rounded-full border border-[#BFC9C3] bg-[#F8FAF7] px-4 text-sm outline-none transition placeholder:text-[#747875] focus:border-[#0F5A47] focus:ring-4 focus:ring-[#0F5A47]/15"
            maxLength={600}
            name="content"
            placeholder="Add a comment..."
            required
          />
        </label>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0F5A47] px-4 text-sm font-semibold text-white hover:bg-[#0B4939]"
          type="submit"
        >
          <Send aria-hidden="true" className="size-4" />
          Reply
        </button>
      </form>
    </ShongjogCard>
  );
}
