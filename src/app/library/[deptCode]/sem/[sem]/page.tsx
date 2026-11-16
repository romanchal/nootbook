import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAppUser } from "@/features/auth/guards";
import { getSemesterSubjects } from "@/features/library/queries";
import { getSemesterYearName } from "@/features/library/format";
import { AppNavbar } from "@/components/layout/app-navbar";

export const dynamic = "force-dynamic";

interface SemesterPageProps {
  params: Promise<{ deptCode: string; sem: string }>;
}

export default async function SemesterPage({ params }: SemesterPageProps) {
  const user = await requireAppUser();
  const { deptCode, sem } = await params;
  const semesterNum = parseInt(sem, 10);

  if (!user.collegeId || isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
    notFound();
  }

  const result = await getSemesterSubjects(user.collegeId, deptCode, semesterNum);
  if (!result) {
    notFound();
  }

  const { department, subjects } = result;
  const yearName = getSemesterYearName(semesterNum);

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
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <Link href="/dashboard" className="hover:text-blue-700 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/library" className="hover:text-blue-700 transition-colors">
            Library
          </Link>
          <span>/</span>
          <Link href={`/library/${department.code.toLowerCase()}`} className="hover:text-blue-700 transition-colors">
            {department.code}
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">Semester {semesterNum}</span>
        </nav>

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-500/5 p-6 sm:p-8 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-700 text-white px-2.5 py-0.5 text-xs font-bold shadow-2xs">
                {yearName} · Semester {semesterNum}
              </span>
              <span className="text-xs text-muted-foreground">Autonomous Curriculum</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {department.name} — Sem {semesterNum}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Select a subject below to view verified Term I & Term II examination papers, university questions, and topper study notes.
            </p>
          </div>
        </div>

        {/* Subjects Grid */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>📖</span> Curriculum Subjects
            </h2>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {subjects.length} subjects
            </span>
          </div>

          {subjects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground bg-card/50">
              No subjects uploaded yet for Semester {semesterNum}.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {subjects.map((sub) => {
                const hasPapers = sub._count.resources > 0;
                return (
                  <Link
                    key={sub.id}
                    href={`/library/${department.code.toLowerCase()}/subject/${sub.id}`}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-xs hover:-translate-y-0.5 ${
                      hasPapers
                        ? "border-blue-500/40 bg-gradient-to-br from-card via-card to-blue-500/5 hover:border-blue-600 hover:shadow-md"
                        : "border-border/80 bg-card hover:border-border hover:shadow-sm"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        {sub.code ? (
                          <span className={`font-mono text-xs font-extrabold rounded-lg px-2.5 py-0.5 ${
                            hasPapers
                              ? "bg-blue-700 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {sub.code}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Core</span>
                        )}

                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          hasPapers
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {hasPapers ? `📄 ${sub._count.resources} Exam Papers Live` : "0 Resources"}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base sm:text-lg font-bold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                        {sub.name}
                      </h3>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-2.5 text-xs">
                      <span className="text-muted-foreground">Term Papers & Notes</span>
                      <span className="font-bold text-blue-700 dark:text-blue-300 group-hover:translate-x-1 transition-transform">
                        Explore →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
