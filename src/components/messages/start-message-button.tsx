import { MessageCircle } from "lucide-react";

import { startConversationAction } from "@/app/messages/actions";

export function StartMessageButton({
  className = "",
  otherUserId,
}: {
  className?: string;
  otherUserId: string;
}) {
  return (
    <form action={startConversationAction}>
      <input name="otherUserId" type="hidden" value={otherUserId} />
      <button
        className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#1E293B] px-4 text-sm font-semibold text-[#1E293B] transition hover:bg-[#F2F4F1] sm:w-auto ${className}`}
        type="submit"
      >
        <MessageCircle aria-hidden="true" className="size-4" />
        Message
      </button>
    </form>
  );
}
