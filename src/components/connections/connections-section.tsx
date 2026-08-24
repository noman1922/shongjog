import { ConnectionCard } from "@/components/connections/connection-card";
import { ShongjogCard } from "@/components/shongjog/surface";
import type { ConnectionRecord } from "@/lib/connections/types";

export function ConnectionsSection({
  connections,
  emptyText,
  mode,
  title,
}: {
  connections: ConnectionRecord[];
  emptyText: string;
  mode: "connected" | "received" | "sent";
  title: string;
}) {
  return (
    <ShongjogCard className="p-5 sm:p-6 border-border/80">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-border/60 dark:border-slate-800 pb-3">
        <h2 className="text-base sm:text-lg font-bold text-foreground">
          {title}
        </h2>
        <span className="rounded-full bg-muted dark:bg-slate-800 px-3 py-0.5 text-xs font-semibold text-muted-foreground">
          {connections.length}
        </span>
      </div>

      {connections.length > 0 ? (
        <div className="grid gap-3">
          {connections.map((connection) => (
            <ConnectionCard
              connection={connection}
              key={connection.id}
              mode={mode}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed py-2">
          {emptyText}
        </p>
      )}
    </ShongjogCard>
  );
}
