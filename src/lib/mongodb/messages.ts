import "server-only";

import { ObjectId, type Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongodb/client";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseClient>>;

const CONVERSATION_LIMIT = 30;
const MESSAGE_LIMIT = 50;
const MAX_MESSAGE_LENGTH = 2000;

export type MongoConversationDocument = {
  _id: ObjectId;
  createdAt: Date;
  directKey: string;
  lastMessageAt: Date | null;
  memberIds: string[];
  updatedAt: Date;
};

export type MongoMessageDocument = {
  _id: ObjectId;
  content: string;
  conversationId: ObjectId;
  createdAt: Date;
  deletedAt: Date | null;
  senderId: string;
  updatedAt: Date;
};

export type MongoConversationSummary = {
  id: string;
  directKey: string;
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  lastMessageAt: string | null;
  memberIds: string[];
  updatedAt: string;
};

export type MongoMessage = {
  content: string;
  conversationId: string;
  createdAt: string;
  deletedAt: string | null;
  id: string;
  senderId: string;
  updatedAt: string;
};

let indexesPromise: Promise<void> | null = null;

function directKeyFor(userId: string, otherUserId: string) {
  return [userId, otherUserId].sort().join(":");
}

function toObjectId(value: string) {
  if (!ObjectId.isValid(value)) {
    throw new Error("Invalid conversation id.");
  }

  return new ObjectId(value);
}

function toConversation(document: MongoConversationDocument): MongoConversationSummary {
  return {
    directKey: document.directKey,
    id: document._id.toHexString(),
    lastMessage: null,
    lastMessageAt: document.lastMessageAt?.toISOString() ?? null,
    memberIds: document.memberIds,
    updatedAt: document.updatedAt.toISOString(),
  };
}

function toMessage(document: MongoMessageDocument): MongoMessage {
  return {
    content: document.content,
    conversationId: document.conversationId.toHexString(),
    createdAt: document.createdAt.toISOString(),
    deletedAt: document.deletedAt?.toISOString() ?? null,
    id: document._id.toHexString(),
    senderId: document.senderId,
    updatedAt: document.updatedAt.toISOString(),
  };
}

async function collections() {
  const db = await getMongoDb();

  return {
    conversations: db.collection<MongoConversationDocument>("conversations"),
    messages: db.collection<MongoMessageDocument>("messages"),
  };
}

async function ensureMessageIndexes() {
  if (!indexesPromise) {
    indexesPromise = (async () => {
      const { conversations, messages } = await collections();

      await Promise.all([
        conversations.createIndex({ directKey: 1 }, { unique: true }),
        conversations.createIndex({ memberIds: 1, lastMessageAt: -1 }),
        messages.createIndex({ conversationId: 1, createdAt: -1 }),
      ]);
    })();
  }

  return indexesPromise;
}

async function requireServerUser(userId: string) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || user.id !== userId) {
    throw new Error("Unauthorized messaging actor.");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role === "admin") {
    throw new Error("Complete a student or alumni profile before using messages.");
  }

  return supabase;
}

async function areUsersConnected(
  supabase: SupabaseServerClient,
  userId: string,
  otherUserId: string
) {
  const [outgoing, incoming] = await Promise.all([
    supabase
      .from("connections")
      .select("id")
      .eq("requester_id", userId)
      .eq("receiver_id", otherUserId)
      .eq("status", "accepted")
      .maybeSingle(),
    supabase
      .from("connections")
      .select("id")
      .eq("requester_id", otherUserId)
      .eq("receiver_id", userId)
      .eq("status", "accepted")
      .maybeSingle(),
  ]);

  return Boolean(outgoing.data || incoming.data);
}

async function requireConversationMembership({
  conversationId,
  conversations,
  userId,
}: {
  conversationId: ObjectId;
  conversations: Collection<MongoConversationDocument>;
  userId: string;
}) {
  const conversation = await conversations.findOne(
    {
      _id: conversationId,
      memberIds: userId,
    },
    {
      projection: {
        _id: 1,
        createdAt: 1,
        directKey: 1,
        lastMessageAt: 1,
        memberIds: 1,
        updatedAt: 1,
      },
    }
  );

  if (!conversation) {
    throw new Error("Conversation not found or access denied.");
  }

  return conversation;
}

export async function findOrCreateConversation(userId: string, otherUserId: string) {
  if (!userId || !otherUserId || userId === otherUserId) {
    throw new Error("Choose another Shongjog member.");
  }

  const supabase = await requireServerUser(userId);

  await ensureMessageIndexes();

  const connected = await areUsersConnected(supabase, userId, otherUserId);

  if (!connected) {
    throw new Error("You can only message accepted connections.");
  }

  const { conversations } = await collections();
  const now = new Date();
  const directKey = directKeyFor(userId, otherUserId);

  await conversations.updateOne(
    { directKey },
    {
      $setOnInsert: {
        createdAt: now,
        directKey,
        lastMessageAt: null,
        memberIds: [userId, otherUserId],
        updatedAt: now,
      },
    },
    { upsert: true }
  );

  const conversation = await conversations.findOne(
    { directKey, memberIds: userId },
    {
      projection: {
        _id: 1,
        createdAt: 1,
        directKey: 1,
        lastMessageAt: 1,
        memberIds: 1,
        updatedAt: 1,
      },
    }
  );

  if (!conversation) {
    throw new Error("Conversation could not be opened.");
  }

  return toConversation(conversation);
}

export async function getConversations(userId: string) {
  await requireServerUser(userId);
  await ensureMessageIndexes();

  const { conversations } = await collections();
  const documents = await conversations
    .aggregate<
      MongoConversationDocument & {
        lastMessage?: Pick<
          MongoMessageDocument,
          "content" | "createdAt" | "senderId"
        >[];
      }
    >([
      { $match: { memberIds: userId } },
      { $sort: { lastMessageAt: -1, updatedAt: -1 } },
      { $limit: CONVERSATION_LIMIT },
      {
        $lookup: {
          as: "lastMessage",
          from: "messages",
          let: { conversationId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$conversationId", "$$conversationId"] },
                deletedAt: null,
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 0,
                content: 1,
                createdAt: 1,
                senderId: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          directKey: 1,
          lastMessage: 1,
          lastMessageAt: 1,
          memberIds: 1,
          updatedAt: 1,
        },
      },
    ])
    .toArray();

  return documents.map((document) => {
    const conversation = toConversation(document);
    const lastMessage = document.lastMessage?.[0];

    return {
      ...conversation,
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt.toISOString(),
            senderId: lastMessage.senderId,
          }
        : null,
    };
  });
}

export async function getConversation(conversationId: string, userId: string) {
  await requireServerUser(userId);
  await ensureMessageIndexes();

  const { conversations } = await collections();
  const conversation = await requireConversationMembership({
    conversationId: toObjectId(conversationId),
    conversations,
    userId,
  });

  return toConversation(conversation);
}

export async function getMessages(conversationId: string, userId: string) {
  await requireServerUser(userId);
  await ensureMessageIndexes();

  const { conversations, messages } = await collections();
  const objectId = toObjectId(conversationId);

  await requireConversationMembership({
    conversationId: objectId,
    conversations,
    userId,
  });

  const documents = await messages
    .find(
      {
        conversationId: objectId,
        deletedAt: null,
      },
      {
        projection: {
          _id: 1,
          content: 1,
          conversationId: 1,
          createdAt: 1,
          deletedAt: 1,
          senderId: 1,
          updatedAt: 1,
        },
      }
    )
    .sort({ createdAt: -1 })
    .limit(MESSAGE_LIMIT)
    .toArray();

  return documents.reverse().map(toMessage);
}

export async function sendMessage(
  conversationId: string,
  userId: string,
  content: string
) {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Write a message first.");
  }

  if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
    throw new Error("Messages must be 2,000 characters or fewer.");
  }

  await requireServerUser(userId);
  await ensureMessageIndexes();

  const { conversations, messages } = await collections();
  const objectId = toObjectId(conversationId);

  await requireConversationMembership({
    conversationId: objectId,
    conversations,
    userId,
  });

  const now = new Date();
  const result = await messages.insertOne({
    _id: new ObjectId(),
    content: trimmedContent,
    conversationId: objectId,
    createdAt: now,
    deletedAt: null,
    senderId: userId,
    updatedAt: now,
  });

  const message = await messages.findOne(
    { _id: result.insertedId },
    {
      projection: {
        _id: 1,
        content: 1,
        conversationId: 1,
        createdAt: 1,
        deletedAt: 1,
        senderId: 1,
        updatedAt: 1,
      },
    }
  );

  if (!message) {
    throw new Error("Message could not be saved.");
  }

  await conversations.updateOne(
    { _id: objectId, memberIds: userId },
    {
      $set: {
        lastMessageAt: now,
        updatedAt: now,
      },
    }
  );

  return toMessage(message);
}

export async function deleteOwnMessage(
  conversationId: string,
  userId: string,
  messageId: string
) {
  await requireServerUser(userId);
  await ensureMessageIndexes();

  const { conversations, messages } = await collections();
  const objectConversationId = toObjectId(conversationId);
  const objectMessageId = toObjectId(messageId);

  await requireConversationMembership({
    conversationId: objectConversationId,
    conversations,
    userId,
  });

  await messages.updateOne(
    {
      _id: objectMessageId,
      conversationId: objectConversationId,
      senderId: userId,
    },
    {
      $set: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );
}

export async function testMongoMessagingConnection() {
  await ensureMessageIndexes();

  const { conversations, messages } = await collections();
  const [conversationIndexes, messageIndexes] = await Promise.all([
    conversations.indexes(),
    messages.indexes(),
  ]);

  return {
    collectionIndexes: {
      conversations: conversationIndexes.map((index) => index.name).filter(Boolean),
      messages: messageIndexes.map((index) => index.name).filter(Boolean),
    },
    ok: true,
  };
}
