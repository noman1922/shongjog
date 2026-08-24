import { redirect } from "next/navigation";

import { MessagesView } from "@/components/messages/messages-view";
import { getConnectionsOverview } from "@/lib/connections/data";
import { getConversationSummaries } from "@/lib/messages/data";
import { getOnboardingStatus } from "@/lib/onboarding/status";
import { getOwnProfile } from "@/lib/profile/data";
import { createClient } from "@/lib/supabase/server";

function messageError(value?: string) {
  if (!value) {
    return null;
  }

  const messages: Record<string, string> = {
    conversation_creation_failed: "Could not open this conversation. Please try again.",
    invalid_target: "Could not identify the member to message.",
    not_connected: "You can only message accepted Shongjog connections.",
    self_message: "You cannot start a conversation with yourself.",
    start_failed: "Could not open this conversation. Please try again.",
    unauthorized: "Please sign in again to use messages.",
  };

  return messages[value] ?? value;
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const status = await getOnboardingStatus();

  if (!status.completed) {
    redirect("/onboarding");
  }

  if (status.role === "admin") {
    redirect("/admin");
  }

  const profile = await getOwnProfile();

  if (!profile) {
    redirect("/onboarding");
  }

  const [conversations, connectionsOverview] = await Promise.all([
    getConversationSummaries(user.id),
    getConnectionsOverview(),
  ]);
  const connectedFriends = connectionsOverview.connected.map((c) => c.otherUser);
  const params = await searchParams;

  return (
    <MessagesView
      connectedFriends={connectedFriends}
      conversations={conversations}
      currentUserId={user.id}
      error={messageError(params.error)}
      profile={profile}
    />
  );
}
