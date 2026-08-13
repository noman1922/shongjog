import Link from "next/link";

import type { ConversationSummary, MessageUser } from "@/lib/messages/types";
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

function Avatar({ user }: { user: MessageUser }) {
  if (user.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" className="size-12 rounded-full object-cover" src={user.avatarUrl} />;
  }

  return (
    <div className="flex size-12 items-center justify-center rounded-full bg-[#E6E9E5] text-sm font-bold text-[#0F5A47]">
      {initials(user.fullName)}
    </div>
  );
}

export function ConversationList({
  activeConversationId,
  conversations,
}: {
  activeConversationId?: string;
  conversations: ConversationSummary[];
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#BFC9C3] bg-white shadow-[0_4px_12px_rgba(30,41,59,0.04)]">
      <div className="border-b border-[#BFC9C3]/70 p-4">
        <h1 className="text-xl font-bold text-[#191C1B]">Messages</h1>
        <p className="mt-1 text-sm text-[#747875]">
          Private conversations with your accepted Shongjog connections.
        </p>
      </div>

      {conversations.length > 0 ? (
        <div className="divide-y divide-[#BFC9C3]/60">
          {conversations.map((conversation) => {
            const active = conversation.id === activeConversationId;

            return (
              <Link
                className={cn(
                  "flex min-w-0 gap-3 p-4 transition hover:bg-[#F8FAF7]",
                  active && "bg-[#E1F7EE]"
                )}
                href={`/messages/${conversation.id}`}
                key={conversation.id}
              >
                <Avatar user={conversation.otherUser} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-[#191C1B]">
                        {conversation.otherUser.fullName ?? "Shongjog member"}
                      </span>
                      <span className="mt-0.5 block text-xs capitalize text-[#747875]">
                        {conversation.otherUser.role}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-[#747875]">
                      {formatTime(
                        conversation.lastMessage?.createdAt ?? conversation.updatedAt
                      )}
                    </span>
                  </span>
                  <span className="mt-2 flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-[#3F4945]">
                      {conversation.lastMessage
                        ? conversation.lastMessage.content
                        : "No messages yet."}
                    </span>
                    {conversation.unreadCount > 0 ? (
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0F5A47] text-xs font-bold text-white">
                        {conversation.unreadCount > 9
                          ? "9+"
                          : conversation.unreadCount}
                      </span>
                    ) : null}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-5">
          <p className="text-sm leading-6 text-[#3F4945]">
            Your message list is empty. Open a connected member profile and
            start a conversation from the Message button.
          </p>
        </div>
      )}
    </section>
  );
}
