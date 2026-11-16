import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAppUser } from "@/features/auth/guards";
import { getSemesterSubjects } from "@/features/library/queries";
import { getSemesterYearName } from "@/features/library/format";

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
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/library" className="hover:text-foreground">
          Library
        </Link>
        <span>/</span>
        <Link href={`/library/${department.code.toLowerCase()}`} className="hover:text-foreground">
          {department.code}
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Sem {semesterNum}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-2 rounded-xl border bg-card p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="rounded bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {yearName} · Semester {semesterNum}
          </span>
          <span className="text-xs text-muted-foreground">Level 4: Subject Selection</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {department.name} — Semester {semesterNum} Subjects
        </h1>
        <p className="text-sm text-muted-foreground">
          Select a subject to view verified question papers, toppers notes, and practical manuals.
        </p>
      </div>

      {/* Subjects List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Curriculum Subjects</h2>
          <span className="text-xs text-muted-foreground">{subjects.length} subjects</span>
        </div>

        {subjects.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No subjects uploaded yet for Semester {semesterNum}.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {subjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/library/${department.code.toLowerCase()}/subject/${sub.id}`}
                className="group flex flex-col justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary hover:shadow-xs focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    {sub.code ? (
                      <span className="font-mono text-xs font-bold text-primary">
                        {sub.code}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Core</span>
                    )}
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {sub._count.resources} papers/notes
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-foreground group-hover:text-primary">
                    {sub.name}
                  </h3>
                </div>

                <div className="mt-4 flex items-center justify-end text-xs font-medium text-primary group-hover:underline">
                  Open Subject Hub →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
