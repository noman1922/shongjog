"use server";

import { revalidatePath } from "next/cache";

import { getAuthenticatedUser } from "@/lib/connections/data";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function refreshConnectionPaths(username?: string | null) {
  revalidatePath("/connections");
  revalidatePath("/discover");
  revalidatePath("/profile");

  if (username) {
    revalidatePath(`/profile/${username}`);
  }
}

async function getProfileUser(
  supabase: Awaited<ReturnType<typeof getAuthenticatedUser>>["supabase"],
  userId: string
) {
  const { data } = await supabase
    .from("users")
    .select("id, role, full_name, username")
    .eq("id", userId)
    .maybeSingle();

  if (!data || data.role === "admin") {
    return null;
  }

  return data;
}

async function createNotification({
  actorId,
  connectionId,
  message,
  recipientId,
  type,
}: {
  actorId: string;
  connectionId: string;
  message: string;
  recipientId: string;
  type: "connection_accepted" | "connection_request";
}) {
  const { supabase } = await getAuthenticatedUser();

  await supabase.from("notifications").insert({
    actor_id: actorId,
    message,
    reference_id: connectionId,
    type,
    user_id: recipientId,
  });
}

export async function sendConnectionRequestAction(formData: FormData) {
  const receiverId = formString(formData, "receiverId");
  const receiverUsername = formString(formData, "receiverUsername");
  const { error, supabase, user } = await getAuthenticatedUser();

  if (error || !user) {
    return;
  }

  if (!receiverId || receiverId === user.id) {
    return;
  }

  const [receiver, currentProfile, outgoing, incoming] = await Promise.all([
    getProfileUser(supabase, receiverId),
    getProfileUser(supabase, user.id),
    supabase
      .from("connections")
      .select("id, status")
      .eq("requester_id", user.id)
      .eq("receiver_id", receiverId)
      .maybeSingle(),
    supabase
      .from("connections")
      .select("id, status")
      .eq("requester_id", receiverId)
      .eq("receiver_id", user.id)
      .maybeSingle(),
  ]);

  if (!receiver || !currentProfile) {
    return;
  }

  if (
    outgoing.data?.status === "pending" ||
    incoming.data?.status === "pending" ||
    outgoing.data?.status === "accepted" ||
    incoming.data?.status === "accepted"
  ) {
    refreshConnectionPaths(receiverUsername);
    return;
  }

  let connectionId = outgoing.data?.id;

  if (connectionId) {
    const { error: updateError } = await supabase
      .from("connections")
      .update({ status: "pending" })
      .eq("id", connectionId)
      .eq("requester_id", user.id)
      .eq("receiver_id", receiverId);

    if (updateError) {
      return;
    }
  } else {
    const { data, error: insertError } = await supabase
      .from("connections")
      .insert({
        receiver_id: receiverId,
        requester_id: user.id,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !data) {
      return;
    }

    connectionId = data.id;
  }

  await createNotification({
    actorId: user.id,
    connectionId,
    message: `${currentProfile.full_name ?? "Someone"} sent you a connection request.`,
    recipientId: receiverId,
    type: "connection_request",
  });

  refreshConnectionPaths(receiver.username ?? receiverUsername);
}

export async function acceptConnectionRequestAction(formData: FormData) {
  const connectionId = formString(formData, "connectionId");
  const otherUsername = formString(formData, "otherUsername");
  const { error, supabase, user } = await getAuthenticatedUser();

  if (error || !user || !connectionId) {
    return;
  }

  const { data: connection } = await supabase
    .from("connections")
    .select("id, requester_id, receiver_id, status")
    .eq("id", connectionId)
    .eq("receiver_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (!connection) {
    return;
  }

  const { error: updateError } = await supabase
    .from("connections")
    .update({ status: "accepted" })
    .eq("id", connection.id)
    .eq("receiver_id", user.id);

  if (!updateError) {
    const currentProfile = await getProfileUser(supabase, user.id);
    await createNotification({
      actorId: user.id,
      connectionId: connection.id,
      message: `${currentProfile?.full_name ?? "Someone"} accepted your connection request.`,
      recipientId: connection.requester_id,
      type: "connection_accepted",
    });
  }

  refreshConnectionPaths(otherUsername);
}

export async function rejectConnectionRequestAction(formData: FormData) {
  const connectionId = formString(formData, "connectionId");
  const otherUsername = formString(formData, "otherUsername");
  const { error, supabase, user } = await getAuthenticatedUser();

  if (error || !user || !connectionId) {
    return;
  }

  await supabase
    .from("connections")
    .update({ status: "rejected" })
    .eq("id", connectionId)
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  refreshConnectionPaths(otherUsername);
}

export async function cancelConnectionRequestAction(formData: FormData) {
  const connectionId = formString(formData, "connectionId");
  const otherUsername = formString(formData, "otherUsername");
  const { error, supabase, user } = await getAuthenticatedUser();

  if (error || !user || !connectionId) {
    return;
  }

  await supabase
    .from("connections")
    .update({ status: "cancelled" })
    .eq("id", connectionId)
    .eq("requester_id", user.id)
    .eq("status", "pending");

  refreshConnectionPaths(otherUsername);
}

export async function removeConnectionAction(formData: FormData) {
  const connectionId = formString(formData, "connectionId");
  const otherUsername = formString(formData, "otherUsername");
  const { error, supabase, user } = await getAuthenticatedUser();

  if (error || !user || !connectionId) {
    return;
  }

  const { data: connection } = await supabase
    .from("connections")
    .select("id, requester_id, receiver_id, status")
    .eq("id", connectionId)
    .eq("status", "accepted")
    .maybeSingle();

  if (
    !connection ||
    (connection.requester_id !== user.id && connection.receiver_id !== user.id)
  ) {
    return;
  }

  await supabase
    .from("connections")
    .update({ status: "cancelled" })
    .eq("id", connectionId);

  refreshConnectionPaths(otherUsername);
}
