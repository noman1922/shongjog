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
  state,
}: {
  profileUserId: string;
  profileUsername: string | null;
  state: ProfileConnectionState;
}) {
  if (state.kind === "self") {
    return null;
  }

  if (state.kind === "connected") {
    return (
      <form action={removeConnectionAction}>
        <input name="connectionId" type="hidden" value={state.connectionId} />
        <input name="otherUsername" type="hidden" value={profileUsername ?? ""} />
        <Button className="h-11 w-full sm:w-auto" type="submit" variant="outline">
          Connected
        </Button>
      </form>
    );
  }

  if (state.kind === "outgoing_pending") {
    return (
      <form action={cancelConnectionRequestAction}>
        <input name="connectionId" type="hidden" value={state.connectionId} />
        <input name="otherUsername" type="hidden" value={profileUsername ?? ""} />
        <Button className="h-11 w-full sm:w-auto" type="submit" variant="outline">
          Pending
        </Button>
      </form>
    );
  }

  if (state.kind === "incoming_pending") {
    return (
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <form action={acceptConnectionRequestAction}>
          <input name="connectionId" type="hidden" value={state.connectionId} />
          <input name="otherUsername" type="hidden" value={profileUsername ?? ""} />
          <Button className="h-11 w-full sm:w-auto" type="submit">
            Accept
          </Button>
        </form>
        <form action={rejectConnectionRequestAction}>
          <input name="connectionId" type="hidden" value={state.connectionId} />
          <input name="otherUsername" type="hidden" value={profileUsername ?? ""} />
          <Button className="h-11 w-full sm:w-auto" type="submit" variant="outline">
            Reject
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form action={sendConnectionRequestAction}>
      <input name="receiverId" type="hidden" value={profileUserId} />
      <input name="receiverUsername" type="hidden" value={profileUsername ?? ""} />
      <Button className="h-11 w-full sm:w-auto" type="submit">
        Connect
      </Button>
    </form>
  );
}
