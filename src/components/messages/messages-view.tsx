import { MessageCircle } from "lucide-react";

import { ConversationList } from "@/components/messages/conversation-list";
import { MessageThread } from "@/components/messages/message-thread";
import { AppShell } from "@/components/shongjog/app-shell";
import { ShongjogCard } from "@/components/shongjog/surface";
import type {
  ConversationSummary,
  ConversationThread,
} from "@/lib/messages/types";
import type { PublicProfile } from "@/lib/profile/types";

function EmptyChatPanel() {
  return (
    <ShongjogCard className="hidden min-h-[calc(100dvh-8rem)] items-center justify-center p-8 text-center lg:flex">
      <div className="max-w-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#E1F7EE] text-[#0F5A47]">
          <MessageCircle aria-hidden="true" className="size-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-[#191C1B]">
          Select a conversation
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#3F4945]">
          Open a message thread from the list, or start one from a connected
          member profile.
        </p>
      </div>
    </ShongjogCard>
  );
}

export function MessagesView({
  activeConversationId,
  conversations,
  currentUserId,
  error,
  profile,
  thread,
}: {
  activeConversationId?: string;
  conversations: ConversationSummary[];
  currentUserId: string;
  error?: string | null;
  profile: PublicProfile;
  thread?: ConversationThread | null;
}) {
  return (
    <AppShell active="Messages" profile={profile}>
      <div className="mx-auto grid w-full max-w-[1280px] gap-5 px-4 pb-24 pt-5 sm:px-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:px-8 lg:pb-8">
        <div className={thread ? "hidden lg:block" : "block"}>
          {error ? (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}
          <ConversationList
            activeConversationId={activeConversationId}
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
