import { redirect } from "next/navigation";

import { ConnectionsSection } from "@/components/connections/connections-section";
import { AppShell } from "@/components/shongjog/app-shell";
import { LinkButton } from "@/components/ui/button";
import { getConnectionsOverview } from "@/lib/connections/data";
import { getOnboardingStatus } from "@/lib/onboarding/status";
import { getOwnProfile } from "@/lib/profile/data";
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
    getOwnProfile(),
  ]);

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <AppShell active="Circles" profile={profile}>
      <div className="mx-auto w-full max-w-[1120px] space-y-5 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#14B8A6]">
              Network
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#191C1B] sm:text-3xl">
              Circles
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[#3F4945]">
              Manage pending requests and people you are connected with.
            </p>
          </div>
          <LinkButton
            className="h-11 w-full border-[#0F5A47] text-[#0F5A47] sm:w-auto"
            href="/profile"
            variant="outline"
          >
            Back to profile
          </LinkButton>
        </header>

        <div className="grid gap-5">
          <ConnectionsSection
            connections={overview.receivedPending}
            emptyText="No pending requests received."
            mode="received"
            title="Pending requests received"
          />
          <ConnectionsSection
            connections={overview.sentPending}
            emptyText="No sent requests are pending."
            mode="sent"
            title="Sent requests"
          />
          <ConnectionsSection
            connections={overview.connected}
            emptyText="No connections yet."
            mode="connected"
            title="Connected users"
          />
        </div>
      </div>
    </AppShell>
  );
}
