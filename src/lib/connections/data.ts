import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type {
  ConnectionRecord,
  ConnectionsOverview,
  ConnectionStatus,
  ConnectionUser,
  ProfileConnectionState,
} from "@/lib/connections/types";

const CONNECTIONS_OVERVIEW_LIMIT = 150;

type DbConnection = {
  created_at: string;
  id: string;
  receiver_id: string;
  requester_id: string;
  status: ConnectionStatus;
};

type DbUser = {
  avatar_url: string | null;
  full_name: string | null;
  id: string;
  role: "student" | "alumni" | "admin";
  username: string | null;
};

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Please sign in again.", supabase, user: null };
  }

  return { error: null, supabase, user };
}

export const getProfileConnectionState = cache(
  async (viewerUserId: string, profileUserId: string): Promise<ProfileConnectionState> => {
    if (viewerUserId === profileUserId) {
      return { kind: "self" };
    }

    const supabase = await createClient();
    const [outgoing, incoming] = await Promise.all([
      supabase
        .from("connections")
        .select("id, status")
        .eq("requester_id", viewerUserId)
        .eq("receiver_id", profileUserId)
        .maybeSingle(),
      supabase
        .from("connections")
        .select("id, status")
        .eq("requester_id", profileUserId)
        .eq("receiver_id", viewerUserId)
        .maybeSingle(),
    ]);

    if (outgoing.data?.status === "accepted" || incoming.data?.status === "accepted") {
      return {
        connectionId: outgoing.data?.id ?? incoming.data!.id,
        kind: "connected",
      };
    }

    if (incoming.data?.status === "pending") {
      return { connectionId: incoming.data.id, kind: "incoming_pending" };
    }

    if (outgoing.data?.status === "pending") {
      return { connectionId: outgoing.data.id, kind: "outgoing_pending" };
    }

    return { kind: "none" };
  }
);

async function getUsersById(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, ConnectionUser>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, role, full_name, username, avatar_url")
    .in("id", Array.from(new Set(userIds)));

  return new Map(
    ((data ?? []) as DbUser[]).map((user) => [
      user.id,
      {
        avatarUrl: user.avatar_url,
        fullName: user.full_name,
        id: user.id,
        role: user.role,
        username: user.username,
      },
    ])
  );
}

function toConnectionRecord(
  connection: DbConnection,
  currentUserId: string,
  users: Map<string, ConnectionUser>
): ConnectionRecord | null {
  const otherUserId =
    connection.requester_id === currentUserId
      ? connection.receiver_id
      : connection.requester_id;
  const otherUser = users.get(otherUserId);

  if (!otherUser || otherUser.role === "admin") {
    return null;
  }

  return {
    createdAt: connection.created_at,
    id: connection.id,
    otherUser,
    status: connection.status,
  };
}

export const getConnectionsOverview = cache(async (): Promise<ConnectionsOverview> => {
  const { error, supabase, user } = await getAuthenticatedUser();

  if (error || !user) {
    return { connected: [], receivedPending: [], sentPending: [] };
  }

  const { data } = await supabase
    .from("connections")
    .select("id, requester_id, receiver_id, status, created_at")
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .in("status", ["pending", "accepted"])
    .order("updated_at", { ascending: false })
    .limit(CONNECTIONS_OVERVIEW_LIMIT);

  const connections = (data ?? []) as DbConnection[];
  const users = await getUsersById(
    connections.map((connection) =>
      connection.requester_id === user.id
        ? connection.receiver_id
        : connection.requester_id
    )
  );

  const overview: ConnectionsOverview = {
    connected: [],
    receivedPending: [],
    sentPending: [],
  };

  connections.forEach((connection) => {
    const record = toConnectionRecord(connection, user.id, users);

    if (!record) {
      return;
    }

    if (connection.status === "accepted") {
      overview.connected.push(record);
    } else if (connection.receiver_id === user.id) {
      overview.receivedPending.push(record);
    } else {
      overview.sentPending.push(record);
    }
  });

  return overview;
});

export const getPendingConnectionCount = cache(async (): Promise<number> => {
  const { error, supabase, user } = await getAuthenticatedUser();

  if (error || !user) {
    return 0;
  }

  const { count } = await supabase
    .from("connections")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  return count ?? 0;
});
