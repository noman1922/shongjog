"use client";

import {
  ArrowRight,
  MessageCircle,
  MessageSquarePlus,
  Search,
  SquarePen,
  UserX,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";

import { startConversationAction } from "@/app/messages/actions";
import { ShongjogCard } from "@/components/shongjog/surface";
import type { ConnectionUser } from "@/lib/connections/types";
import type { ConversationSummary, MessageUser } from "@/lib/messages/types";
import { cn, getInitials } from "@/lib/utils";

function formatTime(value: string) {
  const date = new Date(value);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function Avatar({
  avatarUrl,
  fullName,
  size = "md",
}: {
  avatarUrl?: string | null;
  fullName?: string | null;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "size-9" : "size-11";
  const dimension = size === "sm" ? 36 : 44;

  if (avatarUrl) {
    return (
      <div
        className={`relative ${sizeClass} shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20 shadow-sm`}
      >
        <Image
          alt={fullName ?? "Avatar"}
          className="size-full rounded-full object-cover"
          height={dimension}
          src={avatarUrl}
          width={dimension}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex ${sizeClass} items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-2 ring-primary/20 shrink-0`}
    >
      {getInitials(fullName)}
    </div>
  );
}

function StartDirectMessageButton({
  friendId,
  isPending,
  onStart,
}: {
  friendId: string;
  isPending: boolean;
  onStart: (friendId: string) => void;
}) {
  return (
    <button
      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-95"
      disabled={isPending}
      onClick={() => onStart(friendId)}
      type="button"
    >
      <MessageCircle className="size-3.5" />
      <span>Chat</span>
    </button>
  );
}

export function ConversationList({
  activeConversationId,
  connectedFriends = [],
  conversations,
}: {
  activeConversationId?: string;
  connectedFriends?: ConnectionUser[];
  conversations: ConversationSummary[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Set of user IDs who already have an active conversation
  const activeConversationUserIds = useMemo(
    () => new Set(conversations.map((c) => c.otherUser.id)),
    [conversations]
  );

  // Filter conversations by query
  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.otherUser.fullName?.toLowerCase().includes(q) ||
        c.otherUser.username?.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // Connected friends who don't have an active conversation yet or match search
  const filteredStartableFriends = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return connectedFriends.filter((friend) => {
      // Must not already have an active conversation displayed in filteredConversations
      const hasActiveConvo = activeConversationUserIds.has(friend.id);
      if (!q) return !hasActiveConvo;
      return (
        !hasActiveConvo &&
        (friend.fullName?.toLowerCase().includes(q) ||
          friend.username?.toLowerCase().includes(q))
      );
    });
  }, [connectedFriends, activeConversationUserIds, searchQuery]);

  const handleStartChat = (otherUserId: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("otherUserId", otherUserId);
      await startConversationAction(formData);
    });
  };

  const handleComposeClick = () => {
    setShowCompose((prev) => !prev);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const isSearching = searchQuery.trim().length > 0;
  const noMatches =
    isSearching &&
    filteredConversations.length === 0 &&
    filteredStartableFriends.length === 0;

  return (
    <ShongjogCard className="overflow-hidden border-border/80">
      {/* Header */}
      <div className="border-b border-border/60 dark:border-slate-800 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">Messages</h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {conversations.length}{" "}
              {conversations.length === 1 ? "thread" : "threads"}
            </span>
          </div>

          <button
            aria-label="New conversation with connection"
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-all duration-200",
              showCompose
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={handleComposeClick}
            title="New message with connected friends"
            type="button"
          >
            <SquarePen className="size-4" />
          </button>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          Private network conversations
        </p>

        {/* Dedicated Connection Search Bar */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            className="w-full rounded-xl border border-border/80 dark:border-slate-800 bg-muted/50 dark:bg-slate-800/70 py-2 pl-9 pr-8 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-card dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends or connections..."
            ref={searchInputRef}
            type="search"
            value={searchQuery}
          />
          {searchQuery ? (
            <button
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
              type="button"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Compose Tray (Toggled by SquarePen Button when not searching) */}
      {showCompose && !isSearching ? (
        <div className="border-b border-border/60 dark:border-slate-800 bg-primary/5 dark:bg-primary/10 p-3 sm:p-4 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MessageSquarePlus className="size-3.5 text-primary" /> Start New
              Chat
            </span>
            <span className="text-[11px] text-muted-foreground">
              {connectedFriends.length} connected friends
            </span>
          </div>

          {filteredStartableFriends.length > 0 ? (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {filteredStartableFriends.map((friend) => (
                <div
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-card border border-border/60 hover:border-primary/40 transition-colors"
                  key={friend.id}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      avatarUrl={friend.avatarUrl}
                      fullName={friend.fullName}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-foreground">
                        {friend.fullName ?? "Shongjog member"}
                      </p>
                      <p className="truncate text-[10px] capitalize text-muted-foreground">
                        {friend.role}
                      </p>
                    </div>
                  </div>
                  <StartDirectMessageButton
                    friendId={friend.id}
                    isPending={isPending}
                    onStart={handleStartChat}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              All of your connected friends have active conversations. Use the
              search bar above to find specific messages.
            </p>
          )}
        </div>
      ) : null}

      {/* Search Results / Content View */}
      {noMatches ? (
        /* Non-Friend Restriction Guard */
        <div className="p-6 sm:p-8 text-center space-y-2.5">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <UserX className="size-6" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-foreground">
            No connected friends found
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            You can only direct message accepted connections on Shongjog.
          </p>
          <Link
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
            href="/discover"
          >
            <span>Find and connect with members on Discover</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      ) : isSearching ? (
        /* Active Search Multi-Section List */
        <div className="divide-y divide-border/50 dark:divide-slate-800/80">
          {/* Section 1: Active Conversations */}
          {filteredConversations.length > 0 ? (
            <div>
              <div className="bg-muted/40 dark:bg-slate-800/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Existing Conversations ({filteredConversations.length})
              </div>
              <div className="divide-y divide-border/40 dark:divide-slate-800/60">
                {filteredConversations.map((conversation) => {
                  const active = conversation.id === activeConversationId;
                  return (
                    <Link
                      className={cn(
                        "flex min-w-0 items-center gap-3 p-4 transition-all hover:bg-muted/50 dark:hover:bg-slate-800/50",
                        active &&
                          "bg-primary/10 dark:bg-primary/20 border-l-4 border-primary"
                      )}
                      href={`/messages/${conversation.id}`}
                      key={conversation.id}
                    >
                      <Avatar
                        avatarUrl={conversation.otherUser.avatarUrl}
                        fullName={conversation.otherUser.fullName}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs sm:text-sm font-bold text-foreground">
                            {conversation.otherUser.fullName ??
                              "Shongjog member"}
                          </span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {formatTime(
                              conversation.lastMessage?.createdAt ??
                                conversation.updatedAt
                            )}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {conversation.lastMessage
                            ? conversation.lastMessage.content
                            : "Start a conversation..."}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Section 2: Start New Conversation with Connected Friends */}
          {filteredStartableFriends.length > 0 ? (
            <div>
              <div className="bg-muted/40 dark:bg-slate-800/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Start New Chat ({filteredStartableFriends.length})
              </div>
              <div className="divide-y divide-border/40 dark:divide-slate-800/60">
                {filteredStartableFriends.map((friend) => (
                  <div
                    className="flex items-center justify-between gap-3 p-4 hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors"
                    key={friend.id}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        avatarUrl={friend.avatarUrl}
                        fullName={friend.fullName}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs sm:text-sm font-bold text-foreground">
                          {friend.fullName ?? "Shongjog member"}
                        </p>
                        <p className="truncate text-[11px] capitalize text-muted-foreground">
                          {friend.role} · Connected
                        </p>
                      </div>
                    </div>
                    <StartDirectMessageButton
                      friendId={friend.id}
                      isPending={isPending}
                      onStart={handleStartChat}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : conversations.length > 0 ? (
        /* Normal Browsing: All Active Conversations */
        <div className="divide-y divide-border/50 dark:divide-slate-800/80">
          {conversations.map((conversation) => {
            const active = conversation.id === activeConversationId;

            return (
              <Link
                className={cn(
                  "flex min-w-0 items-center gap-3 p-4 transition-all hover:bg-muted/50 dark:hover:bg-slate-800/50",
                  active &&
                    "bg-primary/10 dark:bg-primary/20 border-l-4 border-primary"
                )}
                href={`/messages/${conversation.id}`}
                key={conversation.id}
              >
                <Avatar
                  avatarUrl={conversation.otherUser.avatarUrl}
                  fullName={conversation.otherUser.fullName}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs sm:text-sm font-bold text-foreground">
                      {conversation.otherUser.fullName ?? "Shongjog member"}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatTime(
                        conversation.lastMessage?.createdAt ??
                          conversation.updatedAt
                      )}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-muted-foreground leading-relaxed">
                      {conversation.lastMessage
                        ? conversation.lastMessage.content
                        : "Start a conversation..."}
                    </p>
                    {conversation.unreadCount > 0 ? (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">
                        {conversation.unreadCount > 9
                          ? "9+"
                          : conversation.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State with Quick Start Suggestions */
        <div className="p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircle className="size-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-foreground">
              Your inbox is empty
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Start a private conversation with any of your connected friends.
            </p>
          </div>

          {connectedFriends.length > 0 ? (
            <div className="text-left space-y-2 pt-2 border-t border-border/60">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Connected Friends ({connectedFriends.length})
              </p>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {connectedFriends.map((friend) => (
                  <div
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-card border border-border/70 hover:border-primary/40 transition-colors"
                    key={friend.id}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        avatarUrl={friend.avatarUrl}
                        fullName={friend.fullName}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-foreground">
                          {friend.fullName ?? "Shongjog member"}
                        </p>
                        <p className="truncate text-[10px] capitalize text-muted-foreground">
                          {friend.role}
                        </p>
                      </div>
                    </div>
                    <StartDirectMessageButton
                      friendId={friend.id}
                      isPending={isPending}
                      onStart={handleStartChat}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Link
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all"
              href="/discover"
            >
              <span>Find Connections on Discover</span>
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      )}
    </ShongjogCard>
  );
}
