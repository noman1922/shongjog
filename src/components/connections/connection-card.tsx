import Link from "next/link";

import {
  acceptConnectionRequestAction,
  cancelConnectionRequestAction,
  rejectConnectionRequestAction,
  removeConnectionAction,
} from "@/app/connections/actions";
import { Button } from "@/components/ui/button";
import type { ConnectionRecord } from "@/lib/connections/types";

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

export function ConnectionCard({
  connection,
  mode,
}: {
  connection: ConnectionRecord;
  mode: "connected" | "received" | "sent";
}) {
  const profileHref = connection.otherUser.username
    ? `/profile/${connection.otherUser.username}`
    : "/profile";

  return (
    <article className="rounded-lg border border-[#BFC9C3]/80 bg-[#F8FAF7] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Link className="flex min-w-0 gap-3" href={profileHref}>
          {connection.otherUser.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="size-14 shrink-0 rounded-full border border-[#BFC9C3] object-cover"
              src={connection.otherUser.avatarUrl}
            />
          ) : (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-[#BFC9C3] bg-[#E6E9E5] text-sm font-semibold text-[#0F5A47]">
              {initials(connection.otherUser.fullName)}
            </div>
          )}
          <span className="min-w-0 space-y-1">
            <span className="block break-words font-semibold text-[#191C1B]">
              {connection.otherUser.fullName ?? "Unnamed member"}
            </span>
            <span className="block break-all text-sm text-[#747875]">
              @{connection.otherUser.username ?? "profile"}
            </span>
            <span className="block text-sm capitalize text-[#747875]">
              {connection.otherUser.role}
            </span>
          </span>
        </Link>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {mode === "received" ? (
            <>
              <form action={acceptConnectionRequestAction}>
                <input name="connectionId" type="hidden" value={connection.id} />
                <input
                  name="otherUsername"
                  type="hidden"
                  value={connection.otherUser.username ?? ""}
                />
                <Button className="h-11 w-full sm:w-auto" type="submit">
                  Accept
                </Button>
              </form>
              <form action={rejectConnectionRequestAction}>
                <input name="connectionId" type="hidden" value={connection.id} />
                <input
                  name="otherUsername"
                  type="hidden"
                  value={connection.otherUser.username ?? ""}
                />
                <Button
                  className="h-11 w-full sm:w-auto"
                  type="submit"
                  variant="outline"
                >
                  Reject
                </Button>
              </form>
            </>
          ) : null}

          {mode === "sent" ? (
            <form action={cancelConnectionRequestAction}>
              <input name="connectionId" type="hidden" value={connection.id} />
              <input
                name="otherUsername"
                type="hidden"
                value={connection.otherUser.username ?? ""}
              />
              <Button className="h-11 w-full sm:w-auto" type="submit" variant="outline">
                Cancel
              </Button>
            </form>
          ) : null}

          {mode === "connected" ? (
            <form action={removeConnectionAction}>
              <input name="connectionId" type="hidden" value={connection.id} />
              <input
                name="otherUsername"
                type="hidden"
                value={connection.otherUser.username ?? ""}
              />
              <Button className="h-11 w-full sm:w-auto" type="submit" variant="outline">
                Remove
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </article>
  );
}
