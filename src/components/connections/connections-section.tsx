import { ConnectionCard } from "@/components/connections/connection-card";
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
    <section className="rounded-xl border border-[#BFC9C3] bg-white p-4 shadow-[0_4px_12px_rgba(30,41,59,0.04)] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-[#191C1B]">
          {title}
        </h2>
        <span className="rounded-md bg-[#F2F4F1] px-2 py-1 text-sm text-[#747875]">
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
        <p className="text-sm leading-6 text-[#747875]">{emptyText}</p>
      )}
    </section>
  );
}
