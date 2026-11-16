import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAppUser } from "@/features/auth/guards";
import { getDepartmentWithClasses } from "@/features/library/queries";
import { getSemesterYearName } from "@/features/library/format";
import { AppNavbar } from "@/components/layout/app-navbar";

export const dynamic = "force-dynamic";

interface DepartmentPageProps {
  params: Promise<{ deptCode: string }>;
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  const user = await requireAppUser();
  const { deptCode } = await params;

  if (!user.collegeId) {
    notFound();
  }

  const department = await getDepartmentWithClasses(user.collegeId, deptCode, {
    allowInactive: true,
  });

  if (!department) {
    notFound();
  }

  // If department is NOT active, render the Coming Soon screen
  if (!department.active) {
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

        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6 py-6 sm:py-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/dashboard" className="hover:text-blue-700 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/library" className="hover:text-blue-700 transition-colors">
              Library
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">{department.name}</span>
          </nav>

          <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-500/10 p-8 sm:p-12 text-center shadow-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950 text-3xl text-blue-700 dark:text-blue-300">
              🚀
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 px-3.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
              <span>Branch In Preparation</span>
              <span>·</span>
              <span>Coming Soon</span>
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {department.name}
            </h1>

            <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Curriculum mapping, university previous year papers, and practical files for {department.name} ({department.code}) are currently being verified by campus class representatives.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/library/ai"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-800/20 hover:from-blue-800 hover:to-blue-900 hover:scale-[1.02] transition-all"
              >
                <span>🤖</span>
                <span>Explore Live AI Branch (All 8 Sems) →</span>
              </Link>

              <Link
                href="/library"
                className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-slate-100 transition-colors"
              >
                ← Back to All Branches
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Active department (AI branch): Group classes by academic year (1, 2, 3, 4)
  const years = [1, 2, 3, 4];

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

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-blue-700 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/library" className="hover:text-blue-700 transition-colors">
            Library
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">{department.name}</span>
        </nav>

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-500/5 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  ● ACTIVE · {department.code}
                </span>
                <span className="text-xs text-muted-foreground">Autonomous Curriculum</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {department.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                Choose your semester below to access verified examination question papers (Term I & II), unit-wise lecture notes, and practical files.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/library/search"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <span>🔍 Search {department.code}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Years & Semesters Grid */}
        <div className="flex flex-col gap-6">
          {years.map((yearNum) => {
            const yearName = getSemesterYearName(yearNum * 2);
            const sem1 = (yearNum - 1) * 2 + 1;
            const sem2 = yearNum * 2;

            return (
              <section key={yearNum} className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {yearName} (Year {yearNum})
                </h2>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {[sem1, sem2].map((sem) => {
                    const classMatch = department.classes.find((c) => c.semester === sem);
                    const subjectCount = classMatch?._count.subjects ?? 0;
                    const paperCount = classMatch?._count.resources ?? 0;
                    const isSem3 = sem === 3;

                    return (
                      <Link
                        key={sem}
                        href={`/library/${department.code.toLowerCase()}/sem/${sem}`}
                        className={`group flex items-center justify-between rounded-2xl border p-5 transition-all shadow-xs hover:-translate-y-0.5 ${
                          isSem3 || paperCount > 0
                            ? "border-blue-500/40 bg-gradient-to-br from-card via-card to-blue-500/5 hover:border-blue-600 hover:shadow-md"
                            : "border-border/80 bg-card hover:border-blue-400/40 hover:shadow-sm"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                              Semester {sem}
                            </span>
                            {isSem3 ? (
                              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 animate-pulse">
                                🔥 Exam Papers Live
                              </span>
                            ) : (
                              <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                Sem {sem}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {subjectCount > 0 ? `${subjectCount} Curriculum Subjects` : "Curriculum available"}
                            {" · "}
                            <span className={paperCount > 0 ? "font-bold text-foreground" : ""}>
                              {paperCount} {paperCount === 1 ? "resource" : "resources"}
                            </span>
                          </p>
                        </div>

                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300 group-hover:translate-x-1 transition-transform">
                          Explore →
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
