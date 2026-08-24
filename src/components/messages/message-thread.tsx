"use client";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  Loader2,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import {
  deleteOwnMessageAction,
  sendDirectMessageAction,
} from "@/app/messages/actions";
import { ShongjogCard } from "@/components/shongjog/surface";
import type { ConversationThread, DirectMessage } from "@/lib/messages/types";
import { cn, getInitials } from "@/lib/utils";

function formatTimestamp(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "Just now";
  }
}

export function MessageThread({
  currentUserId,
  thread,
}: {
  currentUserId: string;
  thread: ConversationThread;
}) {
  const [messages, setMessages] = useState<DirectMessage[]>(thread.messages);
  const [messageText, setMessageText] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isStudent = thread.otherUser.role === "student";

  // Scroll to bottom helper
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Initial scroll on thread mount
  useEffect(() => {
    setMessages(thread.messages);
    scrollToBottom("auto");
  }, [thread.messages, scrollToBottom]);

  // Handle instant optimistic send
  const handleSendMessage = useCallback(
    async (textToSend: string) => {
      const cleanContent = textToSend.trim();
      if (!cleanContent) return;

      // 1. Generate temp id for optimistic UI
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimisticMsg: DirectMessage = {
        content: cleanContent,
        createdAt: new Date().toISOString(),
        deletedAt: null,
        id: tempId,
        isOwn: true,
        senderId: currentUserId,
        status: "sending",
        tempId,
      };

      // 2. Instantly append message to UI
      setMessages((prev) => [...prev, optimisticMsg]);
      setMessageText("");
      setSendError(null);

      // 3. Scroll to bottom immediately
      setTimeout(() => scrollToBottom("smooth"), 30);

      // 4. Background dispatch without blocking composer
      startTransition(async () => {
        try {
          const result = await sendDirectMessageAction(
            thread.conversationId,
            cleanContent
          );

          if (result.error) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempId ? { ...m, status: "error" } : m
              )
            );
            setSendError(result.error);
            return;
          }

          if (result.message) {
            const confirmed = result.message;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempId
                  ? {
                      ...m,
                      createdAt: confirmed.createdAt,
                      id: confirmed.id,
                      status: "sent",
                    }
                  : m
              )
            );
          }
        } catch {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, status: "error" } : m))
          );
          setSendError("Message could not be delivered. Tap retry to try again.");
        }
      });
    },
    [currentUserId, thread.conversationId, scrollToBottom]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(messageText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(messageText);
    }
  };

  const handleRetryMessage = (tempId: string, content: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== tempId));
    handleSendMessage(content);
  };

  return (
    <ShongjogCard className="flex min-h-[calc(100dvh-9rem)] flex-col overflow-hidden border-border/80 shadow-sm">
      {/* Thread Header */}
      <header className="flex items-center gap-3 border-b border-border/60 dark:border-slate-800 p-4 bg-card/90 backdrop-blur-xs">
        <Link
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted lg:hidden"
          href="/messages"
        >
          <ArrowLeft className="size-5" />
          <span className="sr-only">Back to list</span>
        </Link>

        <div className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20 shadow-sm">
          {thread.otherUser.avatarUrl ? (
            <Image
              alt={thread.otherUser.fullName ?? "Avatar"}
              className="size-full rounded-full object-cover"
              height={40}
              src={thread.otherUser.avatarUrl}
              width={40}
            />
          ) : (
            <div className="flex size-full items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
              {getInitials(thread.otherUser.fullName)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm sm:text-base font-bold text-foreground">
              {thread.otherUser.fullName ?? "Shongjog member"}
            </h1>
            <span
              className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                isStudent
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                  : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {thread.otherUser.role}
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            @{thread.otherUser.username ?? "member"}
          </p>
        </div>
      </header>

      {/* Messages Feed Area */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 dark:bg-slate-950/30 p-4 scroll-smooth">
        {thread.nextCursor ? (
          <Link
            className="mx-auto flex min-h-8 w-fit items-center justify-center rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-sm"
            href={`/messages/${thread.conversationId}?cursor=${encodeURIComponent(
              thread.nextCursor
            )}`}
          >
            Load older messages
          </Link>
        ) : null}

        {messages.length > 0 ? (
          messages.map((message) => {
            const isSending = message.status === "sending";
            const isError = message.status === "error";

            return (
              <article
                className={cn(
                  "group flex transition-all duration-200",
                  message.isOwn ? "justify-end" : "justify-start"
                )}
                key={message.id}
              >
                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-[72%] rounded-2xl px-4 py-2.5 shadow-xs transition-all",
                    message.isOwn
                      ? isError
                        ? "rounded-br-sm bg-rose-600/90 text-white"
                        : "rounded-br-sm bg-primary text-white"
                      : "rounded-bl-sm border border-border/80 dark:border-slate-800 bg-card text-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed">
                    {message.content}
                  </p>

                  <div
                    className={cn(
                      "mt-1 flex items-center justify-end gap-1.5 text-[10px]",
                      message.isOwn ? "text-white/80" : "text-muted-foreground"
                    )}
                  >
                    <span>{formatTimestamp(message.createdAt)}</span>

                    {/* Status Tick Indicators for Own Messages */}
                    {message.isOwn && (
                      <span className="inline-flex items-center">
                        {isSending ? (
                          <Clock className="size-3 animate-spin text-white/70" />
                        ) : isError ? (
                          <button
                            className="inline-flex items-center gap-1 text-white font-bold hover:underline cursor-pointer"
                            onClick={() =>
                              handleRetryMessage(message.id, message.content)
                            }
                            title="Failed to send. Click to retry."
                            type="button"
                          >
                            <AlertCircle className="size-3 text-white" />
                            <span>Retry</span>
                          </button>
                        ) : (
                          <Check className="size-3 text-white/90" />
                        )}
                      </span>
                    )}

                    {/* Delete Action */}
                    {message.isOwn && !isSending && !isError ? (
                      <form action={deleteOwnMessageAction}>
                        <input
                          name="conversationId"
                          type="hidden"
                          value={thread.conversationId}
                        />
                        <input name="messageId" type="hidden" value={message.id} />
                        <button
                          className="opacity-0 transition group-hover:opacity-100 hover:text-white cursor-pointer ml-1"
                          title="Delete message"
                          type="submit"
                        >
                          <Trash2 className="size-3" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="flex min-h-48 items-center justify-center text-center">
            <p className="max-w-xs text-xs text-muted-foreground leading-relaxed">
              No previous messages. Type below to start your conversation.
            </p>
          </div>
        )}

        {/* Scroll Anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Form */}
      <form
        className="flex items-end gap-2 border-t border-border/60 dark:border-slate-800 bg-card p-3 transition-colors"
        onSubmit={handleSubmit}
      >
        <div className="min-w-0 flex-1">
          <label>
            <span className="sr-only">Write message</span>
            <textarea
              autoFocus
              className="max-h-28 min-h-10 w-full resize-none rounded-2xl border border-border/70 dark:border-slate-700 bg-muted/40 dark:bg-slate-800/60 px-4 py-2.5 text-xs sm:text-sm leading-relaxed outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 text-foreground"
              maxLength={2000}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message (Enter to send, Shift+Enter for new line)..."
              ref={textareaRef}
              rows={1}
              value={messageText}
            />
          </label>

          {sendError ? (
            <p className="mt-1 text-xs font-semibold text-destructive flex items-center gap-1">
              <AlertCircle className="size-3.5" />
              <span>{sendError}</span>
            </p>
          ) : null}
        </div>

        <button
          aria-label="Send message"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-primary/90 active:scale-95 disabled:opacity-40 transition-all mb-0.5 cursor-pointer"
          disabled={!messageText.trim()}
          type="submit"
        >
          <Send className="size-4" />
        </button>
      </form>
    </ShongjogCard>
  );
}
