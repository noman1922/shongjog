"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getMessagingActor } from "@/lib/messages/permissions";
import {
  deleteOwnMessage,
  findOrCreateConversation,
  sendMessage,
} from "@/lib/mongodb/messages";

const uuidSchema = z.uuid();
const objectIdSchema = z.string().regex(/^[0-9a-f]{24}$/i);

const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write a message first.")
    .max(2000, "Messages must be 2,000 characters or fewer."),
  conversationId: objectIdSchema,
});

export type SendMessageState = {
  error?: string;
  message?: {
    content: string;
    createdAt: string;
    id: string;
    senderId: string;
  };
  submittedAt?: number;
};

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function refreshMessages(conversationId?: string) {
  revalidatePath("/messages");

  if (conversationId) {
    revalidatePath(`/messages/${conversationId}`);
  }
}

export async function startConversationAction(formData: FormData) {
  const parsed = uuidSchema.safeParse(formString(formData, "otherUserId"));
  const { error, user } = await getMessagingActor();

  if (!parsed.success) {
    redirect("/messages?error=invalid_target");
  }

  if (error || !user) {
    redirect(`/messages?error=${encodeURIComponent(error ?? "unauthorized")}`);
  }

  if (parsed.data === user.id) {
    redirect("/messages?error=self_message");
  }

  let conversationId: string;

  try {
    const conversation = await findOrCreateConversation(user.id, parsed.data);
    conversationId = conversation.id;
    refreshMessages(conversationId);
  } catch (conversationError) {
    redirect(
      `/messages?error=${encodeURIComponent(
        conversationError instanceof Error
          ? conversationError.message
          : "conversation_creation_failed"
      )}`
    );
  }

  redirect(`/messages/${conversationId}`);
}

export async function sendMessageAction(
  _previousState: SendMessageState,
  formData: FormData
): Promise<SendMessageState> {
  const parsed = sendMessageSchema.safeParse({
    content: formString(formData, "content"),
    conversationId: formString(formData, "conversationId"),
  });
  const { error, user } = await getMessagingActor();

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid message.",
      submittedAt: Date.now(),
    };
  }

  if (error || !user) {
    return { error: error ?? "Please sign in again.", submittedAt: Date.now() };
  }

  try {
    const message = await sendMessage(
      parsed.data.conversationId,
      user.id,
      parsed.data.content
    );

    refreshMessages(parsed.data.conversationId);

    return {
      message: {
        content: message.content,
        createdAt: message.createdAt,
        id: message.id,
        senderId: message.senderId,
      },
      submittedAt: Date.now(),
    };
  } catch (sendError) {
    return {
      error: sendError instanceof Error ? sendError.message : "Could not send message.",
      submittedAt: Date.now(),
    };
  }
}

export async function deleteOwnMessageAction(formData: FormData) {
  const conversationId = formString(formData, "conversationId");
  const messageId = formString(formData, "messageId");
  const parsedConversationId = objectIdSchema.safeParse(conversationId);
  const parsedMessageId = objectIdSchema.safeParse(messageId);
  const { error, user } = await getMessagingActor();

  if (!parsedConversationId.success || !parsedMessageId.success || error || !user) {
    redirect("/messages");
  }

  await deleteOwnMessage(parsedConversationId.data, user.id, parsedMessageId.data);

  refreshMessages(parsedConversationId.data);
  redirect(`/messages/${parsedConversationId.data}`);
}

export async function markConversationReadAction(conversationId: string) {
  const parsed = objectIdSchema.safeParse(conversationId);
  const { error, user } = await getMessagingActor();

  if (!parsed.success || error || !user) {
    return;
  }

  refreshMessages(parsed.data);
}
