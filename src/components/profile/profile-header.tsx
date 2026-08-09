import { Edit3, LogOut, MapPin } from "lucide-react";

import { signOutAction } from "@/app/profile/actions";
import { Button, LinkButton } from "@/components/ui/button";
import type { PublicProfile } from "@/lib/profile/types";

function initials(name: string | null) {
  return (
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S"
  );
}

export function ProfileHeader({ profile }: { profile: PublicProfile }) {
  const academicLine = [
    profile.details.departmentName,
    profile.details.universityName,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <header className="rounded-lg border border-border bg-background p-4 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="size-24 rounded-lg border border-border object-cover"
              src={profile.avatarUrl}
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-lg border border-border bg-muted text-2xl font-semibold">
              {initials(profile.fullName)}
            </div>
          )}

          <div className="min-w-0 space-y-2">
            <div>
              <p className="text-sm font-medium capitalize text-muted-foreground">
                {profile.details.role}
              </p>
              <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                {profile.fullName}
              </h1>
              <p className="break-all text-sm text-muted-foreground">
                @{profile.username}
              </p>
            </div>

            {academicLine ? (
              <p className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
                <span>{academicLine}</span>
              </p>
            ) : null}
          </div>
        </div>

        {profile.isOwner ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <LinkButton
              className="h-11 w-full sm:w-auto"
              href="/profile/edit"
              size="lg"
              variant="outline"
            >
              <Edit3 aria-hidden="true" />
              Edit profile
            </LinkButton>
            <form action={signOutAction}>
              <Button
                className="h-11 w-full sm:w-auto"
                size="lg"
                type="submit"
                variant="ghost"
              >
                <LogOut aria-hidden="true" />
                Logout
              </Button>
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}
