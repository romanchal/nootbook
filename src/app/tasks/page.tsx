import Link from "next/link";
import { requireAppUser } from "@/features/auth/guards";
import { getOpenMarketplaceTasks } from "@/features/tasks/queries";
import { TaskCard } from "@/features/tasks/task-card";
import { TASK_TYPE_META } from "@/features/tasks/format";
import { buttonVariants } from "@/components/ui/button";
import { AppNavbar } from "@/components/layout/app-navbar";
import type { TaskType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

interface TasksPageProps {
  searchParams: Promise<{
    type?: string;
    q?: string;
  }>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const user = await requireAppUser();
  const collegeId = user.collegeId;

  if (!collegeId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppNavbar
          user={{
            id: user.id,
            name: user.name || "Student",
            email: user.email,
            collegeName: user.college?.name,
            collegeCity: user.college?.city,
            roles: user.roles,
          }}
        />
        <main className="mx-auto max-w-4xl px-4 py-12 text-center">
          <p className="text-sm text-destructive">No college profile is associated with your account.</p>
        </main>
      </div>
    );
  }

  const resolved = await searchParams;
  const selectedType = resolved.type && resolved.type in TASK_TYPE_META ? (resolved.type as TaskType) : undefined;
  const query = resolved.q?.trim() || "";

  const tasks = await getOpenMarketplaceTasks(collegeId, {
    type: selectedType,
    search: query || undefined,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background ambient-mesh pb-20 md:pb-12">
      <AppNavbar
        user={{
          id: user.id,
          name: user.name || "Student",
          email: user.email,
          collegeName: user.college?.name,
          collegeCity: user.college?.city,
          roles: user.roles,
        }}
      />

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Task Marketplace</span>
        </nav>

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-500/5 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  Campus P2P Marketplace
                </span>
                <span className="text-xs text-muted-foreground">{user.college?.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Academic Assistance Hub
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                Post formatting, seminar slides, diagram drafting, and LaTeX typing requests, or assist peers for campus income.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
              <Link
                href="/tasks/my"
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all"
              >
                <span>📋</span>
                <span>My Tasks</span>
              </Link>
              <Link
                href="/tasks/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:from-amber-600 hover:to-amber-700 transition-all"
              >
                <span>+</span>
                <span>Post a Task</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <Link
            href="/tasks"
            className={`inline-flex shrink-0 items-center rounded-xl px-3.5 py-2 font-semibold transition-all ${
              !selectedType
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            All Open Tasks ({tasks.length})
          </Link>

          {(Object.keys(TASK_TYPE_META) as TaskType[]).map((type) => {
            const meta = TASK_TYPE_META[type];
            const isActive = selectedType === type;
            return (
              <Link
                key={type}
                href={`/tasks?type=${type}`}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Task Feed */}
        <section className="space-y-3">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-12 text-center bg-card/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-2xl">
                📋
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground">
                No open tasks in this category
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Need assistance formatting a project report, drawing schematic diagrams, or preparing seminar slides?
              </p>
              <Link
                href="/tasks/new"
                className={buttonVariants({ variant: "default", size: "sm", className: "mt-4 bg-gradient-to-r from-amber-500 to-amber-600 font-semibold" })}
              >
                Post the First Task →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
