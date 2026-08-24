"use client";

import {
  Heart,
  Maximize2,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useRef, useState, useTransition } from "react";

import {
  addCommentAction,
  deleteOwnPostAction,
  togglePostLikeAction,
} from "@/app/dashboard/actions";
import { ShongjogCard } from "@/components/shongjog/surface";
import type { FeedComment, FeedPost } from "@/lib/feed/data";
import { cn, getInitials } from "@/lib/utils";

function formatTimestamp(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
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
  role,
}: {
  image: string | null;
  name: string | null;
  role?: string;
}) {
  const isStudent = role === "student";

  if (image) {
    return (
      <div
        className={`relative size-11 shrink-0 overflow-hidden rounded-full ring-2 ${
          isStudent ? "ring-primary/20" : "ring-emerald-500/30"
        }`}
      >
        <Image
          alt={name ?? "Avatar"}
          className="size-full rounded-full object-cover"
          height={44}
          src={image}
          width={44}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold ring-2 ${
        isStudent ? "ring-primary/20" : "ring-emerald-500/30"
      }`}
    >
      {getInitials(name)}
    </div>
  );
}

function AuthorLink({ post }: { post: FeedPost }) {
  const href = post.author.username ? `/profile/${post.author.username}` : "/profile";
  const isStudent = post.author.role === "student";

  return (
    <Link className="group flex min-w-0 items-center gap-3" href={href}>
      <Avatar image={post.author.avatarUrl} name={post.author.fullName} role={post.author.role} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
            {post.author.fullName ?? "Shongjog member"}
          </span>
          <span
            className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
              isStudent
                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900"
                : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900"
            }`}
          >
            {isStudent ? "Student" : "Alumni"}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          @{post.author.username ?? "member"}
          {post.author.roleLine ? ` · ${post.author.roleLine}` : ""}
        </p>
        {post.author.universityName ? (
          <p className="truncate text-[11px] text-muted-foreground/80">
            {post.author.universityName}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function MediaPreview({ post }: { post: FeedPost }) {
  const [activeMediaUrl, setActiveMediaUrl] = useState<string | null>(null);

  if (post.media.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-3.5 overflow-hidden rounded-2xl border border-border/70 dark:border-slate-800 bg-zinc-950/5 dark:bg-zinc-900/50">
        {post.media.slice(0, 4).map((media) =>
          media.mediaType.startsWith("image") ? (
            <div
              className="relative group cursor-pointer overflow-hidden flex items-center justify-center"
              key={media.id}
              onClick={() => setActiveMediaUrl(media.mediaUrl)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Post media"
                className="max-h-[500px] w-full object-contain sm:object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                loading="lazy"
                src={media.mediaUrl}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white rounded-full p-2 backdrop-blur-xs">
                  <Maximize2 className="size-4" />
                </span>
              </div>
            </div>
          ) : (
            <Link
              className="block px-4 py-3 text-sm font-semibold text-primary hover:underline"
              href={media.mediaUrl}
              key={media.id}
            >
              Open attached media
            </Link>
          )
        )}
      </div>

      {/* Lightbox Dialog */}
      {activeMediaUrl ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setActiveMediaUrl(null)}
          role="dialog"
        >
          <button
            aria-label="Close preview"
            className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setActiveMediaUrl(null)}
            type="button"
          >
            <X className="size-6" />
          </button>

          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Expanded post media"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
              src={activeMediaUrl}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

function PostMenu({ post }: { post: FeedPost }) {
  return (
    <details className="relative">
      <summary className="flex size-8 cursor-pointer list-none items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
        <span className="sr-only">Post options</span>
        <MoreHorizontal className="size-4" />
      </summary>
      <div className="absolute right-0 top-9 z-20 min-w-44 rounded-xl border border-border/80 dark:border-slate-800 bg-card p-1.5 shadow-lg backdrop-blur-md">
        {post.isOwnPost ? (
          <form action={deleteOwnPostAction}>
            <input name="postId" type="hidden" value={post.id} />
            <button
              className="flex min-h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
              type="submit"
            >
              <Trash2 className="size-3.5" />
              Delete post
            </button>
          </form>
        ) : (
          <p className="px-3 py-2 text-xs text-muted-foreground">No actions available</p>
        )}
      </div>
    </details>
  );
}

export function FeedPostCard({ post }: { post: FeedPost }) {
  const [optimisticLike, setOptimisticLike] = useOptimistic(
    {
      reactionCount: post.reactionCount,
      viewerHasLiked: post.viewerHasLiked,
    },
    (state, nextLiked: boolean) => ({
      reactionCount: nextLiked
        ? state.reactionCount + (state.viewerHasLiked ? 0 : 1)
        : state.reactionCount - (state.viewerHasLiked ? 1 : 0),
      viewerHasLiked: nextLiked,
    })
  );

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    post.comments,
    (state: FeedComment[], newComment: FeedComment) => [...state, newComment]
  );

  const [, startLikeTransition] = useTransition();
  const [, startCommentTransition] = useTransition();
  const commentFormRef = useRef<HTMLFormElement>(null);

  const handleToggleLike = (formData: FormData) => {
    const nextLiked = !optimisticLike.viewerHasLiked;
    startLikeTransition(async () => {
      setOptimisticLike(nextLiked);
      await togglePostLikeAction(formData);
    });
  };

  const handleAddComment = (formData: FormData) => {
    const content = formData.get("content")?.toString()?.trim();
    if (!content) return;

    const tempComment: FeedComment = {
      authorAvatarUrl: null,
      authorName: "You",
      authorUsername: null,
      content,
      createdAt: new Date().toISOString(),
      id: `temp-${Date.now()}`,
    };

    startCommentTransition(async () => {
      addOptimisticComment(tempComment);
      commentFormRef.current?.reset();
      await addCommentAction(formData);
    });
  };

  const currentCommentCount =
    post.commentCount + (optimisticComments.length - post.comments.length);

  return (
    <ShongjogCard className="overflow-hidden border-border/80 dark:border-slate-800 p-5 sm:p-6 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <AuthorLink post={post} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(post.createdAt)}
          </span>
          <PostMenu post={post} />
        </div>
      </div>

      {/* Post Text */}
      <p className="mt-4 whitespace-pre-wrap break-words text-sm sm:text-[15px] leading-relaxed text-foreground">
        {post.content}
      </p>

      {/* Media Attachments */}
      <MediaPreview post={post} />

      {/* Interaction Stats */}
      <div className="mt-4 flex items-center justify-between border-b border-border/60 dark:border-slate-800/80 pb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="inline-flex size-4 items-center justify-center rounded-full bg-rose-500 text-white text-[9px]">
            ❤
          </span>
          {optimisticLike.reactionCount} {optimisticLike.reactionCount === 1 ? "like" : "likes"}
        </span>
        <span>
          {currentCommentCount} {currentCommentCount === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Interaction Action Buttons */}
      <div className="mt-2 grid grid-cols-3 gap-1 pt-1 text-xs sm:text-sm font-semibold text-muted-foreground">
        <form action={handleToggleLike}>
          <input name="postId" type="hidden" value={post.id} />
          <button
            className={cn(
              "flex min-h-10 w-full items-center justify-center gap-2 rounded-xl hover:bg-muted/70 dark:hover:bg-slate-800 transition-colors",
              optimisticLike.viewerHasLiked && "text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/40"
            )}
            type="submit"
          >
            <Heart
              className={cn("size-4", optimisticLike.viewerHasLiked && "fill-current text-rose-600 dark:text-rose-400")}
            />
            <span>{optimisticLike.viewerHasLiked ? "Liked" : "Like"}</span>
          </button>
        </form>

        <a
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl hover:bg-muted/70 dark:hover:bg-slate-800 hover:text-foreground transition-colors"
          href={`#comment-${post.id}`}
        >
          <MessageCircle className="size-4" />
          <span>Comment</span>
        </a>

        <button
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl text-muted-foreground/60 cursor-not-allowed"
          disabled
          type="button"
        >
          <Share2 className="size-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments List */}
      {optimisticComments.length > 0 ? (
        <div className="mt-4 space-y-3 border-t border-border/60 dark:border-slate-800/80 pt-4">
          {optimisticComments.map((comment) => {
            const commentHref = comment.authorUsername
              ? `/profile/${comment.authorUsername}`
              : "/profile";

            return (
              <article className="flex gap-2.5 sm:gap-3" key={comment.id}>
                <Link href={commentHref}>
                  <Avatar image={comment.authorAvatarUrl} name={comment.authorName} />
                </Link>
                <div className="min-w-0 flex-1 rounded-2xl bg-muted/50 dark:bg-slate-800/60 px-4 py-2.5 border border-border/40 dark:border-slate-700/40">
                  <Link
                    className="text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors"
                    href={commentHref}
                  >
                    {comment.authorName ?? "Shongjog member"}
                  </Link>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed text-foreground/90">
                    {comment.content}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {/* Inline Comment Input Box */}
      <form
        action={handleAddComment}
        className="mt-4 flex items-center gap-2 pt-2"
        id={`comment-${post.id}`}
        ref={commentFormRef}
      >
        <input name="postId" type="hidden" value={post.id} />
        <label className="min-w-0 flex-1">
          <span className="sr-only">Add a comment</span>
          <input
            className="h-10 w-full rounded-full border border-border/70 dark:border-slate-700 bg-muted/50 dark:bg-slate-800/60 px-4 text-xs sm:text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:bg-card dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 transition-all"
            maxLength={600}
            name="content"
            placeholder="Write a comment..."
            required
          />
        </label>
        <button
          aria-label="Send reply"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-transform active:scale-95 shadow-sm"
          type="submit"
        >
          <Send className="size-4" />
        </button>
      </form>
    </ShongjogCard>
  );
}

