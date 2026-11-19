import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAppUser } from "@/features/auth/guards";
import { getSubjectResources } from "@/features/library/queries";
import { getUserBookmarkedResourceIds } from "@/features/library/bookmarks";
import { formatFileSize, RESOURCE_TYPE_META } from "@/features/library/format";
import { ResourceDownloadButton } from "@/features/library/download-button";
import { BookmarkButton } from "@/features/library/bookmark-button";
import { ReportResourceButton } from "@/features/library/report-button";
import { ExamPaperModalTrigger } from "@/features/library/exam-paper-modal";
import { buttonVariants } from "@/components/ui/button";
import { AppNavbar } from "@/components/layout/app-navbar";
import type { ResourceType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

interface SubjectPageProps {
  params: Promise<{ deptCode: string; subjectId: string }>;
  searchParams: Promise<{ type?: string }>;
}

export default async function SubjectPage({ params, searchParams }: SubjectPageProps) {
  const user = await requireAppUser();
  const { deptCode, subjectId } = await params;
  const { type } = await searchParams;

  if (!user.collegeId) {
    notFound();
  }

  const selectedType = type && type in RESOURCE_TYPE_META ? (type as ResourceType) : undefined;
  const [result, bookmarkedIds] = await Promise.all([
    getSubjectResources(user.collegeId, subjectId, selectedType),
    getUserBookmarkedResourceIds(user.collegeId, user.id),
  ]);

  if (!result) {
    notFound();
  }

  const bookmarkedSet = new Set(bookmarkedIds);

  const { subject, resources } = result;
  const department = subject.department;
  const classRecord = subject.class;

  const filterTabs: Array<{ type: ResourceType | "ALL"; label: string }> = [
    { type: "ALL", label: "All Resources" },
    { type: "OLD_PAPER", label: "Exam Papers" },
    { type: "NOTES", label: "Lecture Notes" },
    { type: "LAB_MANUAL", label: "Lab Manuals" },
    { type: "PRACTICAL_FILE", label: "Practicals" },
    { type: "ASSIGNMENT", label: "Assignments" },
  ];

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
          <Link
            href={`/library/${department.code.toLowerCase()}/sem/${classRecord.semester}`}
            className="hover:text-blue-700 transition-colors"
          >
            Sem {classRecord.semester}
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">{subject.name}</span>
        </nav>

        {/* Subject Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-500/5 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {subject.code && (
                  <span className="rounded-lg bg-blue-700 text-white px-2.5 py-0.5 font-mono text-xs font-bold shadow-2xs">
                    {subject.code}
                  </span>
                )}
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  Semester {classRecord.semester} · {department.name}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {subject.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                Priyadarshini Bhagwati College of Engineering repository: Term I & Term II question papers, syllabus, and study notes.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <Link
                href={`/library/upload?subjectId=${subject.id}&deptCode=${deptCode}`}
                className={buttonVariants({
                  size: "sm",
                  className: "gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs",
                })}
              >
                <span>+ Upload</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Tabs / Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {filterTabs.map((tab) => {
            const isActive = tab.type === "ALL" ? !selectedType : selectedType === tab.type;
            const href =
              tab.type === "ALL"
                ? `/library/${deptCode.toLowerCase()}/subject/${subjectId}`
                : `/library/${deptCode.toLowerCase()}/subject/${subjectId}?type=${tab.type}`;

            return (
              <Link
                key={tab.type}
                href={href}
                className={`inline-flex shrink-0 items-center rounded-xl px-3.5 py-1.5 font-semibold transition-all ${
                  isActive
                    ? "bg-blue-700 text-white shadow-xs"
                    : "bg-card border border-border/70 text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Resources Cards Grid */}
        <section className="space-y-4">
          {resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center bg-card/50">
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-950 p-4 text-blue-700 dark:text-blue-300">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">
                No {selectedType ? RESOURCE_TYPE_META[selectedType]?.label : "materials"} found yet
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Upload old exam papers or notes for this subject. Uploads are moderated by the College Admin.
              </p>
            </div>
          ) : (
            resources.map((res) => {
              const meta = RESOURCE_TYPE_META[res.type];
              const isPdf = res.fileName.endsWith(".pdf") || res.mimeType === "application/pdf";
              const paperUrl = res.fileKey.startsWith("papers/") ? `/${res.fileKey}` : "/papers/PBCOE-Semester-3-Consolidated-Exam-Papers.pdf";

              return (
                <article
                  key={res.id}
                  className="group relative flex flex-col gap-3.5 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-all hover:border-blue-500/40 hover:shadow-sm"
                >
                  {/* Meta Badges Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center rounded-lg bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {meta.label}
                      </span>

                      {res.examType && (
                        <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {res.examType}
                        </span>
                      )}

                      {res.academicYear && (
                        <span className="rounded-lg bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {res.academicYear}
                        </span>
                      )}

                      {res.verifiedBadge && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          PBCOE Verified
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-muted-foreground font-mono">
                      {formatFileSize(res.fileSize)}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      {res.title}
                    </h3>
                    {res.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {res.description}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  {res.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {res.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-md bg-muted/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Row: Calculated Button Slots */}
                  <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-border/60 pt-3.5">
                    <div className="text-xs text-muted-foreground">
                      Uploader: <span className="font-semibold text-foreground">{res.uploader.name}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <ExamPaperModalTrigger paperId={res.id} buttonLabel="📄 View Exam Paper" />

                      <Link
                        href={`/library/paper/${res.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-card px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors shadow-2xs"
                      >
                        <span>🖨️ Print Sheet</span>
                      </Link>

                      {isPdf && (
                        <a
                          href={paperUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors shadow-2xs"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          <span>Original PDF</span>
                        </a>
                      )}

                      <BookmarkButton
                        resourceId={res.id}
                        initialBookmarked={bookmarkedSet.has(res.id)}
                        size="icon-sm"
                      />
                      <ReportResourceButton resourceId={res.id} />
                      <ResourceDownloadButton
                        resourceId={res.id}
                        initialDownloads={res.downloadCount}
                        fileName={res.fileName}
                      />
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
