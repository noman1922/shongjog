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
        className={`inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 dark:bg-primary/20 px-4 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors sm:w-auto ${className}`}
        type="submit"
      >
        <MessageCircle aria-hidden="true" className="size-3.5" />
        <span>Message</span>
      </button>
    </form>
  );
}
