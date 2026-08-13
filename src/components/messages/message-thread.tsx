"use client";

import { ArrowLeft, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import {
  deleteOwnMessageAction,
  sendMessageAction,
} from "@/app/messages/actions";
import type { ConversationThread } from "@/lib/messages/types";
import { cn } from "@/lib/utils";

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

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

  return (
    <section className="flex min-h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-xl border border-[#BFC9C3] bg-white shadow-[0_4px_12px_rgba(30,41,59,0.04)] lg:min-h-[calc(100dvh-7rem)]">
      <header className="flex items-center gap-3 border-b border-[#BFC9C3]/70 p-4">
        <Link
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#3F4945] hover:bg-[#F2F4F1] lg:hidden"
          href="/messages"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
          <span className="sr-only">Back to conversations</span>
        </Link>
        {thread.otherUser.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="size-11 rounded-full object-cover"
            src={thread.otherUser.avatarUrl}
          />
        ) : (
          <div className="flex size-11 items-center justify-center rounded-full bg-[#E6E9E5] text-sm font-bold text-[#0F5A47]">
            {initials(thread.otherUser.fullName)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold text-[#191C1B]">
            {thread.otherUser.fullName ?? "Shongjog member"}
          </h1>
          <p className="truncate text-sm capitalize text-[#747875]">
            {thread.otherUser.role}
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-[#F8FAF7] p-4">
        {thread.nextCursor ? (
          <Link
            className="mx-auto flex min-h-10 w-fit items-center justify-center rounded-lg border border-[#BFC9C3] bg-white px-4 text-sm font-semibold text-[#1E293B] hover:bg-[#F2F4F1]"
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
                  "max-w-[82%] rounded-2xl px-4 py-2 shadow-sm sm:max-w-[70%]",
                  message.isOwn
                    ? "rounded-br-md bg-[#0F5A47] text-white"
                    : "rounded-bl-md border border-[#BFC9C3] bg-white text-[#191C1B]"
                )}
              >
                <p className="whitespace-pre-wrap break-words text-sm leading-6">
                  {message.content}
                </p>
                <div
                  className={cn(
                    "mt-1 flex items-center gap-2 text-[11px]",
                    message.isOwn ? "text-white/75" : "text-[#747875]"
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
                        className="opacity-0 transition group-hover:opacity-100"
                        type="submit"
                      >
                        <Trash2 aria-hidden="true" className="size-3.5" />
                        <span className="sr-only">Delete message</span>
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="flex min-h-64 items-center justify-center text-center">
            <p className="max-w-sm text-sm leading-6 text-[#3F4945]">
              No messages yet. Send the first note to start this private
              conversation.
            </p>
          </div>
        )}
      </div>

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
                if (current.some((message) => message.id === sentMessage.id)) {
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
        className="flex gap-2 border-t border-[#BFC9C3]/70 bg-white p-3"
        ref={formRef}
      >
        <div className="min-w-0 flex-1">
          <input name="conversationId" type="hidden" value={thread.conversationId} />
          <label>
            <span className="sr-only">Message</span>
            <textarea
              className="max-h-32 min-h-11 w-full resize-none rounded-xl border border-[#BFC9C3] bg-[#F8FAF7] px-4 py-3 text-sm leading-5 outline-none transition placeholder:text-[#747875] focus:border-[#0F5A47] focus:ring-4 focus:ring-[#0F5A47]/15"
              maxLength={2000}
              name="content"
              placeholder="Write a message..."
              required
            />
          </label>
          {sendError ? (
            <p className="mt-2 text-sm font-medium text-red-700">{sendError}</p>
          ) : null}
        </div>
        <button
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0F5A47] text-white hover:bg-[#0B4939] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSending}
          type="submit"
        >
          <Send aria-hidden="true" className="size-5" />
          <span className="sr-only">Send</span>
        </button>
      </form>
    </section>
  );
}
