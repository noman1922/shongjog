"use client";

import { ArrowLeft, Send, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import {
  deleteOwnMessageAction,
  sendMessageAction,
} from "@/app/messages/actions";
import { ShongjogCard } from "@/components/shongjog/surface";
import type { ConversationThread } from "@/lib/messages/types";
import { cn, getInitials } from "@/lib/utils";

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function MessageThread({
  currentUserId,
  thread,
}: {
  currentUserId: string;
  thread: ConversationThread;
}) {
  const [messages, setMessages] = useState(thread.messages);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isStudent = thread.otherUser.role === "student";

  return (
    <ShongjogCard className="flex min-h-[calc(100dvh-9rem)] flex-col overflow-hidden border-border/80">
      {/* Thread Header */}
      <header className="flex items-center gap-3 border-b border-border/60 dark:border-slate-800 p-4">
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
      <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 dark:bg-slate-950/30 p-4">
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
          messages.map((message) => (
            <article
              className={cn(
                "group flex",
                message.isOwn ? "justify-end" : "justify-start"
              )}
              key={message.id}
            >
              <div
                className={cn(
                  "max-w-[85%] sm:max-w-[72%] rounded-2xl px-4 py-2.5 shadow-sm transition-shadow",
                  message.isOwn
                    ? "rounded-br-sm bg-primary text-white"
                    : "rounded-bl-sm border border-border/80 dark:border-slate-800 bg-card text-foreground"
                )}
              >
                <p className="whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed">
                  {message.content}
                </p>
                <div
                  className={cn(
                    "mt-1 flex items-center justify-end gap-2 text-[10px]",
                    message.isOwn ? "text-white/80" : "text-muted-foreground"
                  )}
                >
                  <span>{formatTimestamp(message.createdAt)}</span>
                  {message.isOwn ? (
                    <form action={deleteOwnMessageAction}>
                      <input
                        name="conversationId"
                        type="hidden"
                        value={thread.conversationId}
                      />
                      <input name="messageId" type="hidden" value={message.id} />
                      <button
                        className="opacity-0 transition group-hover:opacity-100 hover:text-white"
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
          ))
        ) : (
          <div className="flex min-h-48 items-center justify-center text-center">
            <p className="max-w-xs text-xs text-muted-foreground leading-relaxed">
              No previous messages. Type below to start your conversation.
            </p>
          </div>
        )}
      </div>

      {/* Input Message Form */}
      <form
        action={async (formData) => {
          setIsSending(true);
          setSendError(null);

          try {
            const result = await sendMessageAction({}, formData);

            if (result.error) {
              setSendError(result.error);
              return;
            }

            if (result.message) {
              const sentMessage = result.message;
              setMessages((current) => {
                if (current.some((m) => m.id === sentMessage.id)) {
                  return current;
                }

                return [
                  ...current,
                  {
                    content: sentMessage.content,
                    createdAt: sentMessage.createdAt,
                    deletedAt: null,
                    id: sentMessage.id,
                    isOwn: sentMessage.senderId === currentUserId,
                    senderId: sentMessage.senderId,
                  },
                ];
              });
              formRef.current?.reset();
            }
          } catch {
            setSendError("Message could not be sent. Please try again.");
          } finally {
            setIsSending(false);
          }
        }}
        className="flex items-end gap-2 border-t border-border/60 dark:border-slate-800 bg-card p-3"
        ref={formRef}
      >
        <div className="min-w-0 flex-1">
          <input name="conversationId" type="hidden" value={thread.conversationId} />
          <label>
            <span className="sr-only">Write message</span>
            <textarea
              className="max-h-28 min-h-10 w-full resize-none rounded-2xl border border-border/70 dark:border-slate-700 bg-muted/40 dark:bg-slate-800/60 px-4 py-2.5 text-xs sm:text-sm leading-relaxed outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 text-foreground"
              maxLength={2000}
              name="content"
              placeholder="Write a message..."
              required
            />
          </label>
          {sendError ? (
            <p className="mt-1 text-xs font-semibold text-destructive">{sendError}</p>
          ) : null}
        </div>
        <button
          aria-label="Send message"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-primary/90 active:scale-95 disabled:opacity-50 transition-all mb-0.5"
          disabled={isSending}
          type="submit"
        >
          <Send className="size-4" />
        </button>
      </form>
    </ShongjogCard>
  );
}
