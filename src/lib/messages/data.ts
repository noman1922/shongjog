import "server-only";

import { cache } from "react";

import {
  getConversation,
  getConversations,
  getMessages,
} from "@/lib/mongodb/messages";
import type {
  ConversationSummary,
  ConversationThread,
  DirectMessage,
  MessageUser,
} from "@/lib/messages/types";
import { createClient } from "@/lib/supabase/server";

type DbUser = {
  avatar_url: string | null;
  full_name: string | null;
  id: string;
  role: "student" | "alumni" | "admin";
  username: string | null;
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function toMessageUser(user: DbUser | undefined): MessageUser | null {
  if (!user || user.role === "admin") {
    return null;
  }

  return {
    avatarUrl: user.avatar_url,
    fullName: user.full_name,
    id: user.id,
    role: user.role,
    username: user.username,
  };
}

async function getUsersById(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, DbUser>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, role, full_name, username, avatar_url")
    .neq("role", "admin")
    .in("id", unique(userIds));

  return new Map(((data ?? []) as DbUser[]).map((user) => [user.id, user]));
}

export const getUnreadMessageCount = cache(async () => 0);

export const getConversationSummaries = cache(
  async (currentUserId: string): Promise<ConversationSummary[]> => {
    const conversations = await getConversations(currentUserId);
    const otherUserIds = conversations
      .map((conversation) =>
        conversation.memberIds.find((memberId) => memberId !== currentUserId)
      )
      .filter((userId): userId is string => Boolean(userId));
    const users = await getUsersById(otherUserIds);

    return conversations
      .map((conversation) => {
        const otherUserId = conversation.memberIds.find(
          (memberId) => memberId !== currentUserId
        );
        const otherUser = toMessageUser(users.get(otherUserId ?? ""));

        if (!otherUser) {
          return null;
        }

        return {
          id: conversation.id,
          lastMessage: conversation.lastMessage,
          otherUser,
          unreadCount: 0,
          updatedAt: conversation.lastMessageAt ?? conversation.updatedAt,
        };
      })
      .filter((conversation): conversation is ConversationSummary =>
        Boolean(conversation)
      );
  }
);

export async function markConversationRead() {
  // Mongo unread state is intentionally not active in this migration step.
}

export async function getConversationThread({
  conversationId,
  currentUserId,
}: {
  conversationId: string;
  cursor?: string | null;
  currentUserId: string;
}): Promise<ConversationThread | null> {
  try {
    const [conversation, mongoMessages] = await Promise.all([
      getConversation(conversationId, currentUserId),
      getMessages(conversationId, currentUserId),
    ]);
    const otherUserId = conversation.memberIds.find(
      (memberId) => memberId !== currentUserId
    );
    const users = await getUsersById(otherUserId ? [otherUserId] : []);
    const otherUser = toMessageUser(users.get(otherUserId ?? ""));

    if (!otherUser) {
      return null;
    }

    const messages: DirectMessage[] = mongoMessages.map((message) => ({
      content: message.content,
      createdAt: message.createdAt,
      deletedAt: message.deletedAt,
      id: message.id,
      isOwn: message.senderId === currentUserId,
      senderId: message.senderId,
    }));

    return {
      conversationId,
      messages,
      nextCursor: null,
      otherUser,
    };
  } catch {
    return null;
  }
}
