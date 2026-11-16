import Link from "next/link";
import { requireAppUser } from "@/features/auth/guards";
import { getStudentPostedTasks } from "@/features/tasks/queries";
import { AppNavbar } from "@/components/layout/app-navbar";
import { MyTasksClient } from "@/features/tasks/my-tasks-client";

export const dynamic = "force-dynamic";

export default async function MyTasksPage() {
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
          <p className="text-sm text-destructive">No college profile associated with your account.</p>
        </main>
      </div>
    );
  }

  const tasks = await getStudentPostedTasks(collegeId, user.id);

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
          <Link href="/tasks" className="hover:text-foreground transition-colors">
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">My Tasks</span>
        </nav>

        {/* Interactive My Tasks Client Component */}
        <MyTasksClient
          tasks={tasks}
          collegeName={user.college?.name}
        />
      </main>
    </div>
  );
}
