"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TASK_STATUS_META, TASK_TYPE_META, formatDeadline } from "./format";
import { formatPaiseToRupees } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import type { TaskStatus, TaskType } from "@/generated/prisma/client";

export interface MyTaskItem {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  budgetPaise: number;
  deadline: Date | string;
  createdAt: Date | string;
  subject: { name: string; code: string | null } | null;
  earner: { id: string; name: string } | null;
  _count: { bids: number };
}

interface MyTasksClientProps {
  tasks: MyTaskItem[];
  collegeName?: string;
}

type FilterTab = "ALL" | "OPEN" | "IN_PROGRESS" | "DELIVERED" | "COMPLETED";

export function MyTasksClient({ tasks }: MyTasksClientProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Metrics
  const metrics = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === "ASSIGNED").length;
    const delivered = tasks.filter((t) => t.status === "DELIVERED").length;
    const completed = tasks.filter((t) => t.status === "ACCEPTED").length;
    const totalBudgetPaise = tasks.reduce((sum, t) => sum + t.budgetPaise, 0);

    return {
      total,
      inProgress,
      delivered,
      completed,
      totalBudgetPaise,
    };
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Tab filter
      if (activeTab === "OPEN" && t.status !== "OPEN") return false;
      if (activeTab === "IN_PROGRESS" && t.status !== "ASSIGNED") return false;
      if (activeTab === "DELIVERED" && t.status !== "DELIVERED") return false;
      if (activeTab === "COMPLETED" && t.status !== "ACCEPTED") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchSubject = t.subject?.name.toLowerCase().includes(q);
        const matchEarner = t.earner?.name.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSubject && !matchEarner) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-card to-background p-6 shadow-sm">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/20 mb-2">
              <span>📋</span>
              <span>Student Task Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              My Posted Tasks
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-lg">
              Manage requests, inspect submitted bids, review delivered assignments, and release escrow upon satisfaction.
            </p>
          </div>

          <Link
            href="/tasks/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 hover:scale-[1.02] transition-all"
          >
            <span>+</span>
            <span>Post New Task</span>
          </Link>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-8 -bottom-8 h-36 w-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-amber-500/30">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Total Tasks
          </span>
          <p className="mt-1 text-2xl font-bold text-foreground">{metrics.total}</p>
          <span className="text-[11px] text-muted-foreground">Lifetime posted</span>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-blue-500/30">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            In Progress
          </span>
          <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {metrics.inProgress}
          </p>
          <span className="text-[11px] text-muted-foreground">Earner assigned</span>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-amber-500/30">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Deliverables Ready
          </span>
          <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {metrics.delivered}
          </p>
          <span className="text-[11px] text-muted-foreground">Needs your review</span>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-emerald-500/30">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Escrow Invested
          </span>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatPaiseToRupees(metrics.totalBudgetPaise)}
          </p>
          <span className="text-[11px] text-muted-foreground">Double-entry safe</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar rounded-xl border border-border/60 bg-muted/30 p-1 text-xs">
          {(
            [
              { id: "ALL", label: "All Tasks", count: metrics.total },
              { id: "OPEN", label: "Open Bids", count: tasks.filter((t) => t.status === "OPEN").length },
              { id: "IN_PROGRESS", label: "In Progress", count: metrics.inProgress },
              { id: "DELIVERED", label: "Review Needed", count: metrics.delivered },
              { id: "COMPLETED", label: "Completed", count: metrics.completed },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border/80 bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl">
            📝
          </div>
          <h3 className="mt-4 text-base font-bold text-foreground">
            {tasks.length === 0 ? "You haven't posted any tasks yet" : "No tasks match your filter"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            {tasks.length === 0
              ? "Need formatting for a practical record, slide deck design for a seminar, or LaTeX typing? Post a task and campus seniors will bid."
              : "Try switching tabs or clearing your search query."}
          </p>
          <Link
            href="/tasks/new"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "mt-5 bg-gradient-to-r from-amber-500 to-amber-600 font-semibold shadow-xs hover:from-amber-600 hover:to-amber-700",
            })}
          >
            Post Your First Task →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredTasks.map((task) => {
            const typeMeta = TASK_TYPE_META[task.type];
            const statusMeta = TASK_STATUS_META[task.status];
            const deadlineInfo = formatDeadline(task.deadline);

            const isDelivered = task.status === "DELIVERED";
            const isOpen = task.status === "OPEN";
            const isAssigned = task.status === "ASSIGNED";

            return (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="group relative block rounded-2xl border border-border/80 bg-card p-5 shadow-2xs transition-all hover:border-amber-500/40 hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Top Row: Category Badge, Status Badge & Price Tag */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                        typeMeta?.badgeClass ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      <span>{typeMeta?.icon}</span>
                      <span>{typeMeta?.label ?? task.type}</span>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                      <span>{statusMeta.label}</span>
                    </span>

                    {isDelivered && (
                      <span className="rounded-lg bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        ⚡ Deliverable Ready
                      </span>
                    )}
                  </div>

                  {/* Budget with Escrow Badge */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      🛡️ Escrow
                    </span>
                    <span className="font-mono text-base font-extrabold text-foreground">
                      {formatPaiseToRupees(task.budgetPaise)}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="mt-3">
                  <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {task.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                </div>

                {/* Footer Strip */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-3">
                    {task.subject && (
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <span>📖</span>
                        <span>{task.subject.name}</span>
                      </span>
                    )}

                    {task.earner ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 font-medium text-blue-700 dark:text-blue-300">
                        <span>👤 Earner:</span>
                        <strong className="font-semibold">{task.earner.name}</strong>
                      </span>
                    ) : (
                      <span>
                        {task._count.bids} {task._count.bids === 1 ? "submitted bid" : "submitted bids"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {deadlineInfo.text}
                    </span>

                    {/* Action Hint CTA */}
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                      {isDelivered
                        ? "Inspect Deliverables →"
                        : isOpen
                        ? "Review Bids →"
                        : isAssigned
                        ? "Track Progress →"
                        : "View Details →"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
