import { ArrowLeft, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { ConnectionsSection } from "@/components/connections/connections-section";
import { AppShell } from "@/components/shongjog/app-shell";
import { ShongjogCard } from "@/components/shongjog/surface";
import { LinkButton } from "@/components/ui/button";
import { getConnectionsOverview } from "@/lib/connections/data";
import { getOnboardingStatus } from "@/lib/onboarding/status";
import { getViewerProfile } from "@/lib/profile/data";
import { createClient } from "@/lib/supabase/server";

export default async function ConnectionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/connections");
  }

  const status = await getOnboardingStatus();

  if (!status.completed) {
    redirect("/onboarding");
  }

  const [overview, profile] = await Promise.all([
    getConnectionsOverview(),
    getViewerProfile(),
  ]);

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <AppShell active="Circles" profile={profile}>
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 sm:px-6">
        {/* Header Hero */}
        <ShongjogCard className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Users className="size-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Academic Network
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Your Circles
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Manage invitations, pending requests, and verified connections.
              </p>
            </div>

            <LinkButton
              className="h-10 rounded-full border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold px-5 shrink-0 shadow-sm"
              href="/profile"
              variant="outline"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Profile</span>
            </LinkButton>
          </div>
        </ShongjogCard>

        {/* Sections */}
        <div className="grid gap-6">
          <ConnectionsSection
            connections={overview.receivedPending}
            emptyText="No pending invitations received."
            mode="received"
            title="Invitations Received"
          />
          <ConnectionsSection
            connections={overview.sentPending}
            emptyText="No sent invitations are currently pending."
            mode="sent"
            title="Sent Invitations"
          />
          <ConnectionsSection
            connections={overview.connected}
            emptyText="You have not connected with anyone yet. Explore Discover to build your network."
            mode="connected"
            title="Connected Members"
          />
        </div>
      </div>
    </AppShell>
  );
}
