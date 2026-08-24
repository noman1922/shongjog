"use client";

import {
  AlertCircle,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { moderateCommentAction, moderatePostAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { AdminPostItem } from "@/lib/admin/data";

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export function PostModerationTable({
  posts: initialPosts,
}: {
  posts: AdminPostItem[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all");
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ error?: string; message?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const isDeleted = Boolean(p.deletedAt);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !isDeleted) ||
        (statusFilter === "hidden" && isDeleted);

      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        p.content.toLowerCase().includes(term) ||
        p.author.fullName.toLowerCase().includes(term) ||
        (p.author.username && p.author.username.toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });
  }, [posts, statusFilter, searchTerm]);

  const counts = useMemo(() => {
    return {
      active: posts.filter((p) => !p.deletedAt).length,
      all: posts.length,
      hidden: posts.filter((p) => Boolean(p.deletedAt)).length,
    };
  }, [posts]);

  const handleModeratePost = (
    postId: string,
    action: "soft_delete" | "restore" | "hard_delete"
  ) => {
    if (
      action === "hard_delete" &&
      !window.confirm("Are you sure you want to permanently delete this post and all its comments?")
    ) {
      return;
    }

    setFeedback(null);
    setActionLoadingId(postId);

    startTransition(async () => {
      const res = await moderatePostAction(postId, action);
      setActionLoadingId(null);
      if (res.error) {
        setFeedback({ error: res.error });
      } else {
        if (action === "hard_delete") {
          setPosts((prev) => prev.filter((p) => p.id !== postId));
        } else if (action === "soft_delete") {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, deletedAt: new Date().toISOString() } : p
            )
          );
        } else if (action === "restore") {
          setPosts((prev) =>
            prev.map((p) => (p.id === postId ? { ...p, deletedAt: null } : p))
          );
        }
        setFeedback({ message: res.message });
      }
    });
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    if (!window.confirm("Delete this comment permanently?")) return;

    setFeedback(null);
    setActionLoadingId(commentId);

    startTransition(async () => {
      const res = await moderateCommentAction(commentId);
      setActionLoadingId(null);
      if (res.error) {
        setFeedback({ error: res.error });
      } else {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            const updatedComments = p.comments.filter((c) => c.id !== commentId);
            return {
              ...p,
              comments: updatedComments,
              commentsCount: updatedComments.length,
            };
          })
        );
        setFeedback({ message: res.message });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="rounded-[24px] border border-border/80 dark:border-slate-800 bg-card p-4 sm:p-5 card-shadow space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/60 dark:bg-slate-800/80">
            <button
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-card dark:bg-slate-700 text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setStatusFilter("all")}
              type="button"
            >
              All Posts <span className="text-[11px] opacity-70">({counts.all})</span>
            </button>
            <button
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "active"
                  ? "bg-card dark:bg-slate-700 text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setStatusFilter("active")}
              type="button"
            >
              Active Feed <span className="text-[11px] opacity-70">({counts.active})</span>
            </button>
            <button
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "hidden"
                  ? "bg-card dark:bg-slate-700 text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setStatusFilter("hidden")}
              type="button"
            >
              Hidden / Flagged <span className="text-[11px] opacity-70">({counts.hidden})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              className="w-full rounded-xl border border-border/80 dark:border-slate-700 bg-muted/40 dark:bg-slate-800/60 pl-9 pr-3.5 py-2 text-xs sm:text-sm outline-none focus:border-primary focus:bg-card dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search post content or author..."
              type="text"
              value={searchTerm}
            />
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`rounded-xl p-3 text-xs font-medium ${
              feedback.error
                ? "border border-destructive/30 bg-destructive/10 text-destructive"
                : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {feedback.error || feedback.message}
          </div>
        )}
      </div>

      {/* Posts Moderation List */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="rounded-[24px] border border-border/80 dark:border-slate-800 bg-card p-12 text-center text-muted-foreground text-sm card-shadow">
            No posts found matching the selected filter or search term.
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isHidden = Boolean(post.deletedAt);
            const isLoading = actionLoadingId === post.id;
            const isExpanded = expandedPostId === post.id;

            return (
              <div
                className={`rounded-[24px] border bg-card p-5 sm:p-6 card-shadow transition-all duration-200 ${
                  isHidden
                    ? "border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/10 opacity-80"
                    : "border-border/80 dark:border-slate-800"
                }`}
                key={post.id}
              >
                {/* Header: Author Info & Status Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    {post.author.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={post.author.fullName}
                        className="size-10 rounded-full object-cover shrink-0"
                        src={post.author.avatarUrl}
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                        {post.author.fullName[0] || "U"}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {post.author.fullName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          @{post.author.username || "user"}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold capitalize text-muted-foreground">
                          {post.author.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Posted on {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Status & Type Badges */}
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
                      {post.postType}
                    </span>
                    {isHidden ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <EyeOff className="size-3" />
                        <span>Hidden</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Eye className="size-3" />
                        <span>Live Feed</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="py-4">
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                {/* Footer: Stats & Moderation Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60 dark:border-slate-800">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Heart className="size-4 text-rose-500/80" />
                      <span>{post.likesCount} likes</span>
                    </span>
                    <button
                      className="flex items-center gap-1.5 font-medium hover:text-primary transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedPostId(isExpanded ? null : post.id)
                      }
                      type="button"
                    >
                      <MessageSquare className="size-4" />
                      <span>{post.commentsCount} comments {isExpanded ? "(collapse)" : "(expand)"}</span>
                    </button>
                  </div>

                  {/* Moderation Controls */}
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        {isHidden ? (
                          <Button
                            className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                            onClick={() => handleModeratePost(post.id, "restore")}
                            size="sm"
                            type="button"
                          >
                            <Eye className="size-3.5" />
                            <span>Restore to Feed</span>
                          </Button>
                        ) : (
                          <Button
                            className="h-8 px-3 text-xs border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg cursor-pointer"
                            onClick={() => handleModeratePost(post.id, "soft_delete")}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <EyeOff className="size-3.5" />
                            <span>Hide from Feed</span>
                          </Button>
                        )}

                        <Button
                          className="h-8 px-3 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                          onClick={() => handleModeratePost(post.id, "hard_delete")}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Delete Post</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Comments Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/40 space-y-3 animate-in fade-in duration-200">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Comments ({post.comments.length})
                    </p>
                    {post.comments.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No comments on this post.</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {post.comments.map((comment) => (
                          <div
                            className="flex items-start justify-between gap-3 p-3 rounded-xl bg-muted/40 dark:bg-slate-800/40 border border-border/40"
                            key={comment.id}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-foreground">
                                  {comment.author.fullName}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  @{comment.author.username || "user"} · {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-foreground">{comment.content}</p>
                            </div>
                            <button
                              className="text-muted-foreground hover:text-destructive p-1 transition-colors cursor-pointer shrink-0"
                              onClick={() => handleDeleteComment(post.id, comment.id)}
                              title="Delete Comment"
                              type="button"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
