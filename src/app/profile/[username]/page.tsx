import { notFound, redirect } from "next/navigation";

import { LinkButton } from "@/components/ui/button";
import { ProfileView } from "@/components/profile/profile-view";
import { getAuthenticatedUserId, getProfileByUsername } from "@/lib/profile/data";

type PublicProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const viewerUserId = await getAuthenticatedUserId();

  if (!viewerUserId) {
    redirect("/login");
  }

  const { username } = await params;
  const normalizedUsername = decodeURIComponent(username).toLowerCase();

  if (!/^[a-z0-9_]{3,50}$/.test(normalizedUsername)) {
    notFound();
  }

  const profile = await getProfileByUsername(normalizedUsername);

  if (!profile) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
        <section className="w-full max-w-md space-y-4 rounded-lg border border-border p-5 text-center">
          <h1 className="text-xl font-semibold">Profile not found</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            We could not find a completed profile for @{normalizedUsername}.
          </p>
          <LinkButton
            className="h-11 w-full sm:w-auto"
            href="/profile"
            variant="outline"
          >
            Go to my profile
          </LinkButton>
        </section>
      </main>
    );
  }

  return <ProfileView profile={profile} />;
}
