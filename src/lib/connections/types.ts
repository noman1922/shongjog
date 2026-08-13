export type ConnectionStatus = "pending" | "accepted" | "rejected" | "cancelled";

export type ProfileConnectionState =
  | {
      kind: "self" | "none";
    }
  | {
      connectionId: string;
      kind: "incoming_pending" | "outgoing_pending" | "connected";
    };

export type ConnectionUser = {
  avatarUrl: string | null;
  fullName: string | null;
  id: string;
  role: "student" | "alumni" | "admin";
  username: string | null;
};

export type ConnectionRecord = {
  createdAt: string;
  id: string;
  otherUser: ConnectionUser;
  status: ConnectionStatus;
};

export type ConnectionsOverview = {
  connected: ConnectionRecord[];
  receivedPending: ConnectionRecord[];
  sentPending: ConnectionRecord[];
};
