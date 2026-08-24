"use client";

import { Check, Clock, UserPlus, X } from "lucide-react";
import { useState, useTransition } from "react";

import {
  acceptConnectionRequestAction,
  cancelConnectionRequestAction,
  rejectConnectionRequestAction,
  removeConnectionAction,
  sendConnectionRequestAction,
} from "@/app/connections/actions";
import { Button } from "@/components/ui/button";
import type { ProfileConnectionState } from "@/lib/connections/types";

export function ProfileConnectionActions({
  profileUserId,
  profileUsername,
  state: initialState,
}: {
  profileUserId: string;
  profileUsername: string | null;
  state: ProfileConnectionState;
}) {
  const [state, setState] = useState<ProfileConnectionState>(initialState);
  const [isPending, startTransition] = useTransition();

  if (state.kind === "self") {
    return null;
  }

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      setState({
        connectionId: "temp-pending",
        kind: "outgoing_pending",
      });
      const formData = new FormData();
      formData.set("receiverId", profileUserId);
      formData.set("receiverUsername", profileUsername ?? "");
      await sendConnectionRequestAction(formData);
    });
  };

  const handleCancelRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.kind !== "outgoing_pending") return;
    const connectionId = state.connectionId;
    startTransition(async () => {
      setState({ kind: "none" });
      const formData = new FormData();
      formData.set("connectionId", connectionId);
      formData.set("otherUsername", profileUsername ?? "");
      await cancelConnectionRequestAction(formData);
    });
  };

  const handleAcceptRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.kind !== "incoming_pending") return;
    const connectionId = state.connectionId;
    startTransition(async () => {
      setState({
        connectionId,
        kind: "connected",
      });
      const formData = new FormData();
      formData.set("connectionId", connectionId);
      formData.set("otherUsername", profileUsername ?? "");
      await acceptConnectionRequestAction(formData);
    });
  };

  const handleRejectRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.kind !== "incoming_pending") return;
    const connectionId = state.connectionId;
    startTransition(async () => {
      setState({ kind: "none" });
      const formData = new FormData();
      formData.set("connectionId", connectionId);
      formData.set("otherUsername", profileUsername ?? "");
      await rejectConnectionRequestAction(formData);
    });
  };

  const handleRemoveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.kind !== "connected") return;
    const connectionId = state.connectionId;
    startTransition(async () => {
      setState({ kind: "none" });
      const formData = new FormData();
      formData.set("connectionId", connectionId);
      formData.set("otherUsername", profileUsername ?? "");
      await removeConnectionAction(formData);
    });
  };

  if (state.kind === "connected") {
    return (
      <form onSubmit={handleRemoveConnection}>
        <Button
          className="h-9 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-xs font-semibold px-4 transition-colors disabled:opacity-50"
          isDisabled={isPending}
          type="submit"
          variant="outline"
        >
          <Check className="size-3.5" />
          <span>Connected</span>
        </Button>
      </form>
    );
  }

  if (state.kind === "outgoing_pending") {
    return (
      <form onSubmit={handleCancelRequest}>
        <Button
          className="h-9 rounded-full border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-destructive/10 hover:text-destructive text-xs font-semibold px-4 transition-colors disabled:opacity-50"
          isDisabled={isPending}
          type="submit"
          variant="outline"
        >
          <Clock className="size-3.5" />
          <span>Pending</span>
        </Button>
      </form>
    );
  }

  if (state.kind === "incoming_pending") {
    return (
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <form onSubmit={handleAcceptRequest}>
          <Button
            className="h-9 rounded-full bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 shadow-sm disabled:opacity-50"
            isDisabled={isPending}
            type="submit"
          >
            <Check className="size-3.5" />
            <span>Accept</span>
          </Button>
        </form>
        <form onSubmit={handleRejectRequest}>
          <Button
            className="h-9 rounded-full border border-border bg-card hover:bg-destructive/10 hover:text-destructive text-xs font-semibold px-4 disabled:opacity-50"
            isDisabled={isPending}
            type="submit"
            variant="outline"
          >
            <X className="size-3.5" />
            <span>Reject</span>
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSendRequest}>
      <Button
        className="h-9 rounded-full bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 shadow-sm disabled:opacity-50"
        isDisabled={isPending}
        type="submit"
      >
        <UserPlus className="size-3.5" />
        <span>Connect</span>
      </Button>
    </form>
  );
}
