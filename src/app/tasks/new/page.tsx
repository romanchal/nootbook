import Link from "next/link";
import { requireAppUser } from "@/features/auth/guards";
import { getCollegeSubjectsForTask } from "@/features/tasks/queries";
import { PostTaskForm } from "@/features/tasks/post-task-form";
import { AppNavbar } from "@/components/layout/app-navbar";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
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
        <main className="mx-auto max-w-xl py-12 text-center">
          <p className="text-sm text-destructive">No college assigned to your account.</p>
        </main>
      </div>
    );
  }

  const subjects = await getCollegeSubjectsForTask(collegeId);

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

      <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/tasks" className="hover:text-foreground transition-colors">
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Post a Task</span>
        </nav>

        {/* Page Heading Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-500/5 p-6 shadow-sm">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/20 mb-2">
            <span>🛡️</span>
            <span>Escrow Protected Post</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Post an Academic Assistance Task
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xl">
            Connect with skilled campus earners to format documents, polish seminar slides, and draft technical figures with held escrow.
          </p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
          <PostTaskForm subjects={subjects} />
        </div>
      </main>
    </div>
  );
}
