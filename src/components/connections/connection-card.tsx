import Image from "next/image";
import Link from "next/link";

import {
  acceptConnectionRequestAction,
  cancelConnectionRequestAction,
  rejectConnectionRequestAction,
  removeConnectionAction,
} from "@/app/connections/actions";
import { Button } from "@/components/ui/button";
import type { ConnectionRecord } from "@/lib/connections/types";
import { getInitials } from "@/lib/utils";

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
  const isStudent = connection.otherUser.role === "student";

  return (
    <article className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link className="flex min-w-0 items-center gap-3.5 group" href={profileHref}>
          <div className="relative size-13 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20 shadow-sm">
            {connection.otherUser.avatarUrl ? (
              <Image
                alt={connection.otherUser.fullName ?? "Avatar"}
                className="size-full rounded-full object-cover"
                height={52}
                src={connection.otherUser.avatarUrl}
                width={52}
              />
            ) : (
              <div className="flex size-full items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                {getInitials(connection.otherUser.fullName)}
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-0.5">
            <span className="block break-words font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
              {connection.otherUser.fullName ?? "Unnamed member"}
            </span>
            <span className="block text-xs text-muted-foreground">
              @{connection.otherUser.username ?? "profile"}
            </span>
            <span
              className={`inline-block text-[11px] font-semibold capitalize ${
                isStudent
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {connection.otherUser.role}
            </span>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          {mode === "received" ? (
            <>
              <form action={acceptConnectionRequestAction}>
                <input name="connectionId" type="hidden" value={connection.id} />
                <input
                  name="otherUsername"
                  type="hidden"
                  value={connection.otherUser.username ?? ""}
                />
                <Button
                  className="h-9 rounded-full bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 shadow-sm"
                  type="submit"
                >
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
                  className="h-9 rounded-full border border-border bg-card hover:bg-destructive/10 hover:text-destructive text-xs font-semibold px-4"
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
              <Button
                className="h-9 rounded-full border border-border bg-card hover:bg-destructive/10 hover:text-destructive text-xs font-semibold px-4"
                type="submit"
                variant="outline"
              >
                Cancel Request
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
              <Button
                className="h-9 rounded-full border border-border bg-card hover:bg-destructive/10 hover:text-destructive text-xs font-semibold px-4"
                type="submit"
                variant="outline"
              >
                Remove
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </article>
  );
}
