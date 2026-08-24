export type MessageUser = {
  avatarUrl: string | null;
  fullName: string | null;
  id: string;
  role: "student" | "alumni";
  username: string | null;
};

export type ConversationSummary = {
  id: string;
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  otherUser: MessageUser;
  unreadCount: number;
  updatedAt: string;
};

export type DirectMessage = {
  content: string;
  createdAt: string;
  deletedAt: string | null;
  id: string;
  isOwn: boolean;
  senderId: string;
  status?: "sending" | "sent" | "error";
  tempId?: string;
};

export type ConversationThread = {
  conversationId: string;
  messages: DirectMessage[];
  nextCursor: string | null;
  otherUser: MessageUser;
};
