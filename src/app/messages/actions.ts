"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getMessagingActor } from "@/lib/messages/permissions";

const uuidSchema = z.uuid();

const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write a message first.")
    .max(2000, "Messages must be 2,000 characters or fewer."),
  conversationId: z.uuid(),
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
  const { error, supabase, user } = await getMessagingActor();

  if (!parsed.success) {
    redirect("/messages?error=invalid_target");
  }

  if (error || !user) {
    redirect(`/messages?error=${encodeURIComponent(error ?? "unauthorized")}`);
  }

  if (parsed.data === user.id) {
    redirect("/messages?error=self_message");
  }

  const [outgoing, incoming] = await Promise.all([
    supabase
      .from("connections")
      .select("id")
      .eq("requester_id", user.id)
      .eq("receiver_id", parsed.data)
      .eq("status", "accepted")
      .maybeSingle(),
    supabase
      .from("connections")
      .select("id")
      .eq("requester_id", parsed.data)
      .eq("receiver_id", user.id)
      .eq("status", "accepted")
      .maybeSingle(),
  ]);

  if (!outgoing.data && !incoming.data) {
    redirect("/messages?error=not_connected");
  }

  const { data, error: rpcError } = await supabase.rpc(
    "start_direct_conversation",
    { other_user_id: parsed.data }
  );

  if (rpcError || typeof data !== "string") {
    redirect(
      `/messages?error=${encodeURIComponent(
        rpcError?.message ?? "conversation_creation_failed"
      )}`
    );
  }

  refreshMessages(data);
  redirect(`/messages/${data}`);
}

export async function sendMessageAction(
  _previousState: SendMessageState,
  formData: FormData
): Promise<SendMessageState> {
  const parsed = sendMessageSchema.safeParse({
    content: formString(formData, "content"),
    conversationId: formString(formData, "conversationId"),
  });
  const { error, supabase, user } = await getMessagingActor();

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid message.",
      submittedAt: Date.now(),
    };
  }

  if (error || !user) {
    return { error: error ?? "Please sign in again.", submittedAt: Date.now() };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", parsed.data.conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    return {
      error: "You do not have access to this conversation.",
      submittedAt: Date.now(),
    };
  }

  const { data: message, error: insertError } = await supabase
    .from("messages")
    .insert({
      content: parsed.data.content,
      conversation_id: parsed.data.conversationId,
      sender_id: user.id,
    })
    .select("id, sender_id, content, created_at")
    .single();

  if (insertError || !message) {
    return {
      error: insertError?.message ?? "Could not send message.",
      submittedAt: Date.now(),
    };
  }

  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", parsed.data.conversationId)
    .eq("user_id", user.id);

  refreshMessages(parsed.data.conversationId);

  return {
    message: {
      content: message.content,
      createdAt: message.created_at,
      id: message.id,
      senderId: message.sender_id,
    },
    submittedAt: Date.now(),
  };
}

export async function deleteOwnMessageAction(formData: FormData) {
  const conversationId = formString(formData, "conversationId");
  const messageId = formString(formData, "messageId");
  const parsedConversationId = uuidSchema.safeParse(conversationId);
  const parsedMessageId = uuidSchema.safeParse(messageId);
  const { error, supabase, user } = await getMessagingActor();

  if (!parsedConversationId.success || !parsedMessageId.success || error || !user) {
    redirect("/messages");
  }

  await supabase
    .from("messages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", parsedMessageId.data)
    .eq("conversation_id", parsedConversationId.data)
    .eq("sender_id", user.id);

  refreshMessages(parsedConversationId.data);
  redirect(`/messages/${parsedConversationId.data}`);
}

export async function markConversationReadAction(conversationId: string) {
  const parsed = uuidSchema.safeParse(conversationId);
  const { error, supabase, user } = await getMessagingActor();

  if (!parsed.success || error || !user) {
    return;
  }

  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", parsed.data)
    .eq("user_id", user.id);

  refreshMessages(parsed.data);
}
