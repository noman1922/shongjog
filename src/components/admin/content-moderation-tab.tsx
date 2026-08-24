"use client";

import {
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Heart,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState, useTransition } from "react";

import {
  moderateCommentAction,
  moderatePostAction,
  moderateStoryAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { AdminPostItem, AdminStoryItem } from "@/lib/admin/data";
import { getInitials } from "@/lib/utils";

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

export function ContentModerationTab({
  posts: initialPosts,
  stories: initialStories = [],
}: {
  posts: AdminPostItem[];
  stories?: AdminStoryItem[];
}) {
  const [contentType, setContentType] = useState<"posts" | "stories">("posts");
  const [posts, setPosts] = useState(initialPosts);
  const [stories, setStories] = useState(initialStories);
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

  const filteredStories = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return stories.filter((s) => {
      return (
        !term ||
        s.headline.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term) ||
        (s.description && s.description.toLowerCase().includes(term)) ||
        s.author.fullName.toLowerCase().includes(term)
      );
    });
  }, [stories, searchTerm]);

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
        } else {
          setPosts((prev) =>
            prev.map((p) => (p.id === postId ? { ...p, deletedAt: null } : p))
          );
        }
        setFeedback({ message: res.message });
      }
    });
  };

  const handleModerateStory = (storyId: string, headline: string) => {
    if (!window.confirm(`Are you sure you want to permanently remove story: "${headline}"?`)) {
      return;
    }

    setFeedback(null);
    setActionLoadingId(storyId);

    startTransition(async () => {
      const res = await moderateStoryAction(storyId);
      setActionLoadingId(null);
      if (res.error) {
        setFeedback({ error: res.error });
      } else {
        setStories((prev) => prev.filter((s) => s.id !== storyId));
        setFeedback({ message: res.message });
      }
    });
  };

  const handleDeleteComment = (commentId: string, postId: string) => {
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
            return {
              ...p,
              comments: p.comments.filter((c) => c.id !== commentId),
              commentsCount: Math.max(0, p.commentsCount - 1),
            };
          })
        );
        setFeedback({ message: res.message });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="rounded-[24px] border border-border/80 dark:border-slate-800 bg-card p-4 sm:p-5 card-shadow space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Content Type Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 dark:bg-slate-800/80">
            <button
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                contentType === "posts"
                  ? "bg-card dark:bg-slate-700 text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setContentType("posts")}
              type="button"
            >
              <MessageSquare className="size-3.5" />
              <span>Community Posts</span>
              <span className="text-[11px] opacity-70">({posts.length})</span>
            </button>

            <button
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                contentType === "stories"
                  ? "bg-card dark:bg-slate-700 text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setContentType("stories")}
              type="button"
            >
              <ImageIcon className="size-3.5" />
              <span>Active Stories</span>
              <span className="text-[11px] opacity-70">({stories.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full rounded-xl border border-border/80 dark:border-slate-700 bg-muted/40 dark:bg-slate-800/60 pl-9 pr-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${contentType === "posts" ? "posts, authors..." : "stories, authors..."}`}
              type="text"
              value={searchTerm}
            />
          </div>
        </div>

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

      {/* Content Panes */}
      {contentType === "posts" ? (
        <div className="rounded-[24px] border border-border/80 dark:border-slate-800 bg-card card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-800/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 pl-6 pr-4">Author</th>
                  <th className="py-3.5 px-4">Content Preview</th>
                  <th className="py-3.5 px-4">Engagement</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Posted Date</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 dark:divide-slate-800">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td className="py-8 text-center text-muted-foreground" colSpan={6}>
                      No posts found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => {
                    const isDeleted = Boolean(post.deletedAt);
                    const isLoading = actionLoadingId === post.id;
                    const isExpanded = expandedPostId === post.id;

                    return (
                      <tr className="hover:bg-muted/30 dark:hover:bg-slate-800/30 transition-colors" key={post.id}>
                        {/* Author */}
                        <td className="py-4 pl-6 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                              {getInitials(post.author.fullName)}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{post.author.fullName}</p>
                              <p className="text-[11px] text-muted-foreground">@{post.author.username || "user"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Content */}
                        <td className="py-4 px-4 max-w-sm">
                          <p className="line-clamp-2 text-foreground font-medium">{post.content}</p>
                          {post.commentsCount > 0 && (
                            <button
                              className="mt-1 text-[11px] font-bold text-primary hover:underline"
                              onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                              type="button"
                            >
                              {isExpanded ? "Hide Comments" : `View ${post.commentsCount} comment(s)`}
                            </button>
                          )}
                        </td>

                        {/* Engagement */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="size-3 text-rose-500" /> {post.likesCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="size-3 text-blue-500" /> {post.commentsCount}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isDeleted
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {isDeleted ? "Hidden" : "Active"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(post.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 pl-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isLoading ? (
                              <Loader2 className="size-4 animate-spin text-muted-foreground" />
                            ) : (
                              <>
                                {isDeleted ? (
                                  <button
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10"
                                    onClick={() => handleModeratePost(post.id, "restore")}
                                    title="Restore Post to Community Feed"
                                    type="button"
                                  >
                                    <Eye className="size-4" />
                                  </button>
                                ) : (
                                  <button
                                    className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-500/10"
                                    onClick={() => handleModeratePost(post.id, "soft_delete")}
                                    title="Hide Post from Community Feed"
                                    type="button"
                                  >
                                    <EyeOff className="size-4" />
                                  </button>
                                )}

                                <button
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
                                  onClick={() => handleModeratePost(post.id, "hard_delete")}
                                  title="Permanently Delete Post"
                                  type="button"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Stories Moderation Grid */
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredStories.length === 0 ? (
            <div className="col-span-full p-12 text-center text-muted-foreground rounded-3xl border border-border/80 dark:border-slate-800 bg-card">
              <ImageIcon className="size-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No active stories found</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Published 24-hour campus photo stories will appear here
              </p>
            </div>
          ) : (
            filteredStories.map((story) => (
              <div
                className="rounded-3xl border border-border/80 dark:border-slate-800 bg-card overflow-hidden shadow-sm flex flex-col justify-between group"
                key={story.id}
              >
                {/* 9:16 Story Photo Preview */}
                <div className="relative aspect-[9/12] w-full bg-slate-950 overflow-hidden">
                  {story.mediaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={story.headline}
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={story.mediaUrl}
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center bg-gradient-to-br from-primary via-blue-900 to-slate-950">
                      <ImageIcon className="size-8 text-white/40" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                  {/* Top Author Tag */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-1 ring-white">
                        {getInitials(story.author.fullName)}
                      </div>
                      <span className="text-xs font-bold text-white truncate max-w-[120px] drop-shadow">
                        {story.author.fullName}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-white/80 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-full">
                      {story.category}
                    </span>
                  </div>

                  {/* Bottom Headline */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs sm:text-sm font-bold text-white drop-shadow leading-snug line-clamp-2">
                      {story.headline}
                    </p>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="p-3.5 bg-card border-t border-border/60 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="size-3" />
                    <span>{formatDate(story.createdAt)}</span>
                  </div>

                  <Button
                    className="h-8 gap-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white dark:text-rose-400 dark:hover:bg-rose-600 border border-rose-500/20 text-xs font-bold"
                    isDisabled={actionLoadingId === story.id}
                    onClick={() => handleModerateStory(story.id, story.headline)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {actionLoadingId === story.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Trash2 className="size-3" />
                    )}
                    <span>Remove</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
