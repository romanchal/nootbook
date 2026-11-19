import Link from "next/link";
import { notFound } from "next/navigation";
import { PBCOE_PAPERS } from "@/features/library/pbcoe-exam-papers-data";
import { PBCOEExamPaperSheet } from "@/features/library/exam-paper-sheet";
import { AppNavbar } from "@/components/layout/app-navbar";
import { requireAppUser } from "@/features/auth/guards";

export const dynamic = "force-dynamic";

interface PaperPageProps {
  params: Promise<{ paperId: string }>;
}

export default async function PaperPage({ params }: PaperPageProps) {
  const user = await requireAppUser();
  const { paperId } = await params;
  const paper = PBCOE_PAPERS[paperId];

  if (!paper) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 ambient-mesh pb-20 md:pb-12 print:bg-white print:p-0">
      <div className="print:hidden">
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
      </div>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 sm:px-6 py-6 sm:py-8 print:p-0 print:max-w-none">
        {/* Breadcrumb Navigation (hidden in print) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground print:hidden">
          <Link href="/dashboard" className="hover:text-blue-700 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/library" className="hover:text-blue-700 transition-colors">
            Library
          </Link>
          <span>/</span>
          <Link href="/library/ai" className="hover:text-blue-700 transition-colors">
            AI
          </Link>
          <span>/</span>
          <Link href="/library/ai/sem/3" className="hover:text-blue-700 transition-colors">
            Sem 3
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">{paper.courseCode} ({paper.term})</span>
        </nav>

        {/* Paper Sheet Component */}
        <PBCOEExamPaperSheet paper={paper} showPrintAction={true} />
      </main>
    </div>
  );
}
