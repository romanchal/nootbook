import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAppUser } from "@/features/auth/guards";
import { db } from "@/lib/db";
import { UploadForm } from "@/features/library/upload-form";

export const dynamic = "force-dynamic";

interface UploadPageProps {
  searchParams: Promise<{ subjectId?: string; deptCode?: string }>;
}

export default async function UploadPage({ searchParams }: UploadPageProps) {
  const user = await requireAppUser();
  const { subjectId } = await searchParams;

  if (!user.collegeId) {
    notFound();
  }

  // Fetch all active subjects in this college to populate the select list
  const subjects = await db.subject.findMany({
    where: { collegeId: user.collegeId, active: true },
    orderBy: [{ department: { name: "asc" } }, { name: "asc" }],
    include: {
      department: { select: { name: true } },
      class: { select: { semester: true } },
    },
  });

  const formattedSubjects = subjects.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    departmentName: s.department.name,
    semester: s.class.semester,
  }));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/library" className="hover:text-foreground">
          Library
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Upload Resource</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-1 rounded-xl border bg-card p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            Step 4: Quality Control
          </span>
          <span className="text-xs text-muted-foreground">{user.college?.name}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Academic Resource</h1>
        <p className="text-sm text-muted-foreground">
          Share previous year question papers, handwritten lecture notes, or practical lab records.
          All uploads are reviewed by a trusted Class Admin before being published.
        </p>
      </div>

      <UploadForm
        subjects={formattedSubjects}
        preselectedSubjectId={subjectId}
      />
    </main>
  );
}
