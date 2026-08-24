import { MessageCircle } from "lucide-react";

import { ConversationList } from "@/components/messages/conversation-list";
import { MessageThread } from "@/components/messages/message-thread";
import { AppShell } from "@/components/shongjog/app-shell";
import { ShongjogCard } from "@/components/shongjog/surface";
import type { ConnectionUser } from "@/lib/connections/types";
import type {
  ConversationSummary,
  ConversationThread,
} from "@/lib/messages/types";
import type { PublicProfile } from "@/lib/profile/types";

function EmptyChatPanel() {
  return (
    <ShongjogCard className="hidden min-h-[calc(100dvh-9rem)] items-center justify-center p-8 text-center lg:flex border-border/80">
      <div className="max-w-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessageCircle className="size-7" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-foreground">
          Select a conversation
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Choose a conversation from the left, or connect with members on Discover to start collaborating.
        </p>
      </div>
    </ShongjogCard>
  );
}

export function MessagesView({
  activeConversationId,
  connectedFriends = [],
  conversations,
  currentUserId,
  error,
  profile,
  thread,
}: {
  activeConversationId?: string;
  connectedFriends?: ConnectionUser[];
  conversations: ConversationSummary[];
  currentUserId: string;
  error?: string | null;
  profile: PublicProfile;
  thread?: ConversationThread | null;
}) {
  return (
    <AppShell active="Messages" profile={profile}>
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className={thread ? "hidden lg:block" : "block"}>
          {error ? (
            <p className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs sm:text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}
          <ConversationList
            activeConversationId={activeConversationId}
            connectedFriends={connectedFriends}
            conversations={conversations}
          />
        </div>
        {thread ? (
          <MessageThread
            currentUserId={currentUserId}
            key={thread.conversationId}
            thread={thread}
          />
        ) : (
          <EmptyChatPanel />
        )}
      </div>
    </AppShell>
  );
}
