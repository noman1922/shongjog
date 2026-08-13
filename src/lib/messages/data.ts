import "server-only";

import { cache } from "react";

import { getMessagingActor } from "@/lib/messages/permissions";
import type {
  ConversationSummary,
  ConversationThread,
  DirectMessage,
  MessageUser,
} from "@/lib/messages/types";
import { createClient } from "@/lib/supabase/server";

const CONVERSATION_LIMIT = 30;
const MESSAGE_LIMIT = 50;

type DbMembership = {
  conversation_id: string;
  last_read_at: string;
};

type DbConversation = {
  id: string;
  updated_at: string;
};

type DbUser = {
  avatar_url: string | null;
  full_name: string | null;
  id: string;
  role: "student" | "alumni" | "admin";
  username: string | null;
};

type DbMessage = {
  content: string;
  conversation_id: string;
  created_at: string;
  deleted_at: string | null;
  id: string;
  sender_id: string;
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

async function getConversationMemberships(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("conversation_members")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId)
    .order("last_read_at", { ascending: false })
    .limit(CONVERSATION_LIMIT);

  return (data ?? []) as DbMembership[];
}

async function getConversationRows(conversationIds: string[]) {
  if (conversationIds.length === 0) {
    return new Map<string, DbConversation>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select("id, updated_at")
    .in("id", conversationIds)
    .order("updated_at", { ascending: false });

  return new Map(
    ((data ?? []) as DbConversation[]).map((conversation) => [
      conversation.id,
      conversation,
    ])
  );
}

async function getOtherMemberships(conversationIds: string[], currentUserId: string) {
  if (conversationIds.length === 0) {
    return new Map<string, string>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("conversation_members")
    .select("conversation_id, user_id")
    .in("conversation_id", conversationIds)
    .neq("user_id", currentUserId);

  return new Map(
    ((data ?? []) as { conversation_id: string; user_id: string }[]).map((member) => [
      member.conversation_id,
      member.user_id,
    ])
  );
}

async function getLastMessages(conversationIds: string[]) {
  if (conversationIds.length === 0) {
    return new Map<string, DbMessage>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, content, created_at, deleted_at")
    .is("deleted_at", null)
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false })
    .limit(conversationIds.length * 8);
  const lastMessages = new Map<string, DbMessage>();

  ((data ?? []) as DbMessage[]).forEach((message) => {
    if (!lastMessages.has(message.conversation_id)) {
      lastMessages.set(message.conversation_id, message);
    }
  });

  return lastMessages;
}

async function getUnreadCounts({
  conversationIds,
  currentUserId,
  memberships,
}: {
  conversationIds: string[];
  currentUserId: string;
  memberships: Map<string, DbMembership>;
}) {
  if (conversationIds.length === 0) {
    return new Map<string, number>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("conversation_id, sender_id, created_at")
    .is("deleted_at", null)
    .neq("sender_id", currentUserId)
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false })
    .limit(conversationIds.length * 50);
  const counts = new Map<string, number>();

  ((data ?? []) as {
    conversation_id: string;
    created_at: string;
    sender_id: string;
  }[]).forEach((message) => {
    const membership = memberships.get(message.conversation_id);

    if (!membership || message.created_at <= membership.last_read_at) {
      return;
    }

    counts.set(message.conversation_id, (counts.get(message.conversation_id) ?? 0) + 1);
  });

  return counts;
}

export const getUnreadMessageCount = cache(async () => {
  const { error, user } = await getMessagingActor();

  if (error || !user) {
    return 0;
  }

  const memberships = await getConversationMemberships(user.id);
  const membershipMap = new Map(
    memberships.map((membership) => [membership.conversation_id, membership])
  );
  const counts = await getUnreadCounts({
    conversationIds: memberships.map((membership) => membership.conversation_id),
    currentUserId: user.id,
    memberships: membershipMap,
  });

  return Array.from(counts.values()).reduce((total, count) => total + count, 0);
});

export const getConversationSummaries = cache(
  async (currentUserId: string): Promise<ConversationSummary[]> => {
    const memberships = await getConversationMemberships(currentUserId);
    const conversationIds = memberships.map((membership) => membership.conversation_id);

    if (conversationIds.length === 0) {
      return [];
    }

    const membershipMap = new Map(
      memberships.map((membership) => [membership.conversation_id, membership])
    );
    const [conversations, otherMembers, lastMessages, unreadCounts] =
      await Promise.all([
        getConversationRows(conversationIds),
        getOtherMemberships(conversationIds, currentUserId),
        getLastMessages(conversationIds),
        getUnreadCounts({
          conversationIds,
          currentUserId,
          memberships: membershipMap,
        }),
      ]);
    const users = await getUsersById(Array.from(otherMembers.values()));

    return conversationIds
      .map((conversationId) => {
        const conversation = conversations.get(conversationId);
        const otherUser = toMessageUser(users.get(otherMembers.get(conversationId) ?? ""));

        if (!conversation || !otherUser) {
          return null;
        }

        const lastMessage = lastMessages.get(conversationId);

        return {
          id: conversationId,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.created_at,
                senderId: lastMessage.sender_id,
              }
            : null,
          otherUser,
          unreadCount: unreadCounts.get(conversationId) ?? 0,
          updatedAt: conversation.updated_at,
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b!.updatedAt).getTime() - new Date(a!.updatedAt).getTime()
      ) as ConversationSummary[];
  }
);

export async function markConversationRead(conversationId: string, userId: string) {
  const supabase = await createClient();

  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);
}

export async function getConversationThread({
  conversationId,
  cursor,
  currentUserId,
}: {
  conversationId: string;
  cursor?: string | null;
  currentUserId: string;
}): Promise<ConversationThread | null> {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", currentUserId)
    .maybeSingle();

  if (!membership) {
    return null;
  }

  const otherMembers = await getOtherMemberships([conversationId], currentUserId);
  const users = await getUsersById(Array.from(otherMembers.values()));
  const otherUser = toMessageUser(users.get(otherMembers.get(conversationId) ?? ""));

  if (!otherUser) {
    return null;
  }

  let query = supabase
    .from("messages")
    .select("id, conversation_id, sender_id, content, created_at, updated_at, deleted_at")
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(MESSAGE_LIMIT + 1);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data } = await query;
  const rows = (data ?? []) as DbMessage[];
  const pageRows = rows.slice(0, MESSAGE_LIMIT);
  const messages: DirectMessage[] = pageRows
    .map((message) => ({
      content: message.content,
      createdAt: message.created_at,
      deletedAt: message.deleted_at,
      id: message.id,
      isOwn: message.sender_id === currentUserId,
      senderId: message.sender_id,
    }))
    .reverse();

  await markConversationRead(conversationId, currentUserId);

  return {
    conversationId,
    messages,
    nextCursor:
      rows.length > MESSAGE_LIMIT ? pageRows[pageRows.length - 1]?.created_at ?? null : null,
    otherUser,
  };
}
