import Link from "next/link";
import { formatPaiseToRupees } from "@/lib/money";
import { TASK_STATUS_META, TASK_TYPE_META, formatDeadline } from "./format";
import type { TaskStatus, TaskType } from "@/generated/prisma/client";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    type: TaskType;
    status: TaskStatus;
    budgetPaise: number;
    deadline: Date | string;
    createdAt: Date | string;
    subject: { name: string; code: string | null } | null;
    student?: { name: string };
    _count?: { bids: number };
  };
}

export function TaskCard({ task }: TaskCardProps) {
  const typeMeta = TASK_TYPE_META[task.type];
  const statusMeta = TASK_STATUS_META[task.status];
  const deadlineInfo = formatDeadline(task.deadline);

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="group block rounded-2xl border border-border/80 bg-card p-5 shadow-2xs transition-all hover:border-amber-500/40 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
              typeMeta?.badgeClass ?? "bg-muted text-muted-foreground"
            }`}
          >
            <span>{typeMeta?.icon}</span>
            <span>{typeMeta?.label ?? task.type}</span>
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span>{statusMeta.label}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            🛡️ Escrow
          </span>
          <span className="font-mono text-base font-extrabold text-foreground">
            {formatPaiseToRupees(task.budgetPaise)}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
          {task.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {task.subject && (
            <span className="font-medium text-foreground">
              📖 {task.subject.name}
              {task.subject.code ? ` (${task.subject.code})` : ""}
            </span>
          )}
          {task.student && <span>· by {task.student.name}</span>}
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-foreground">
            {task._count?.bids ?? 0} {task._count?.bids === 1 ? "bid" : "bids"}
          </span>
          <span
            className={`font-mono text-[11px] ${
              deadlineInfo.isPast ? "text-destructive font-bold" : "text-muted-foreground"
            }`}
          >
            {deadlineInfo.text}
          </span>
        </div>
      </div>
    </Link>
  );
}
