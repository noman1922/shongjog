import { notFound, redirect } from "next/navigation";

import { MessagesView } from "@/components/messages/messages-view";
import {
  getConversationSummaries,
  getConversationThread,
} from "@/lib/messages/data";
import { getOnboardingStatus } from "@/lib/onboarding/status";
import { getOwnProfile } from "@/lib/profile/data";
import { createClient } from "@/lib/supabase/server";

export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ cursor?: string | string[] }>;
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

  const { conversationId } = await params;

  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) {
    notFound();
  }

  const query = await searchParams;
  const cursor = Array.isArray(query.cursor) ? query.cursor[0] : query.cursor;
  const [conversations, thread] = await Promise.all([
    getConversationSummaries(user.id),
    getConversationThread({
      conversationId,
      cursor,
      currentUserId: user.id,
    }),
  ]);

  if (!thread) {
    notFound();
  }

  return (
    <MessagesView
      activeConversationId={conversationId}
      conversations={conversations}
      currentUserId={user.id}
      profile={profile}
      thread={thread}
    />
  );
}
