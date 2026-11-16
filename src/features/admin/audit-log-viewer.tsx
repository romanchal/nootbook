"use client";

import { useState } from "react";

interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: Date;
  ipAddress: string | null;
  metadata: unknown;
  actor: {
    id: string;
    name: string;
    email: string | null;
  };
  college: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export function AuditLogViewer({ logs }: { logs: AuditLogItem[] }) {
  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const actionTypes = Array.from(new Set(logs.map((l) => l.action)));

  const filteredLogs = logs.filter((log) => {
    if (filterAction === "ALL") return true;
    return log.action === filterAction;
  });

  return (
    <div className="space-y-4">
      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => setFilterAction("ALL")}
          className={`rounded-full px-3 py-1 font-medium transition-colors ${
            filterAction === "ALL"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All Events ({logs.length})
        </button>
        {actionTypes.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => setFilterAction(action)}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              filterAction === action
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {action.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Logs Timeline */}
      {filteredLogs.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No audit log entries found for this filter.
        </div>
      ) : (
        <div className="rounded-xl border bg-card divide-y">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const dateStr = new Date(log.createdAt).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              dateStyle: "medium",
              timeStyle: "short",
            });

            return (
              <div key={log.id} className="p-4 hover:bg-muted/20 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold rounded bg-muted px-2 py-0.5 text-foreground">
                      {log.action}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      on <strong className="text-foreground">{log.entity}</strong> ({log.entityId.slice(0, 8)}…)
                    </span>
                  </div>

                  <span className="text-xs text-muted-foreground font-mono">{dateStr}</span>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>
                      Actor: <strong className="text-foreground">{log.actor.name}</strong> ({log.actor.email ?? log.actor.id})
                    </span>
                    {log.college && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary text-[11px]">
                        {log.college.slug.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {Boolean(log.metadata) && (
                    <button
                      type="button"
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="text-primary hover:underline font-mono text-[11px]"
                    >
                      {isExpanded ? "Hide Metadata ▲" : "View Metadata ▼"}
                    </button>
                  )}
                </div>

                {isExpanded && Boolean(log.metadata) && (
                  <pre className="mt-3 rounded-lg bg-muted/60 p-3 text-[11px] font-mono overflow-x-auto text-foreground">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
