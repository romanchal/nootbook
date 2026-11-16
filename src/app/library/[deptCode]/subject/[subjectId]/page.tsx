import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAppUser } from "@/features/auth/guards";
import { getSubjectResources } from "@/features/library/queries";
import { getUserBookmarkedResourceIds } from "@/features/library/bookmarks";
import { formatFileSize, RESOURCE_TYPE_META } from "@/features/library/format";
import { ResourceDownloadButton } from "@/features/library/download-button";
import { BookmarkButton } from "@/features/library/bookmark-button";
import { ReportResourceButton } from "@/features/library/report-button";
import { buttonVariants } from "@/components/ui/button";
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
    { type: "OLD_PAPER", label: "Old Papers" },
    { type: "NOTES", label: "Notes" },
    { type: "LAB_MANUAL", label: "Lab Manuals" },
    { type: "PRACTICAL_FILE", label: "Practicals" },
    { type: "ASSIGNMENT", label: "Assignments" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      {/* Breadcrumb Navigation (The 3 Taps in reverse) */}
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
        <Link
          href={`/library/${department.code.toLowerCase()}/sem/${classRecord.semester}`}
          className="hover:text-foreground"
        >
          Sem {classRecord.semester}
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{subject.name}</span>
      </nav>

      {/* Subject Header */}
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-xs sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {subject.code && (
              <span className="rounded bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-primary">
                {subject.code}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              Semester {classRecord.semester} · {department.name}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{subject.name}</h1>
          <p className="text-sm text-muted-foreground">
            Verified academic repository: previous year university exam papers, topper lecture notes, and lab manuals.
          </p>
        </div>

        <Link
          href={`/library/upload?subjectId=${subject.id}&deptCode=${deptCode}`}
          className={buttonVariants({ variant: "outline", size: "sm", className: "shrink-0 gap-1" })}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Upload Resource
        </Link>
      </div>

      {/* Filter Tabs / Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
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
              className={`inline-flex shrink-0 items-center rounded-full px-3 py-1.5 font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Level 5: Resources Cards */}
      <section className="space-y-4">
        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              No {selectedType ? RESOURCE_TYPE_META[selectedType]?.label : "resources"} found yet
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Be the first to upload old exam papers or notes for this subject. Uploads are verified by your Class Admin.
            </p>
          </div>
        ) : (
          resources.map((res) => {
            const meta = RESOURCE_TYPE_META[res.type];
            return (
              <article
                key={res.id}
                className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-xs transition-colors hover:border-primary/50"
              >
                {/* Meta Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
                    >
                      {meta.label}
                    </span>

                    {res.academicYear && (
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {res.academicYear}
                      </span>
                    )}

                    {res.examType && (
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {res.examType}
                      </span>
                    )}

                    {res.verifiedBadge && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground font-mono">
                    {formatFileSize(res.fileSize)}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {res.title}
                  </h3>
                  {res.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {res.description}
                    </p>
                  )}
                </div>

                {/* Tags if any */}
                {res.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {res.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded bg-muted/60 px-1.5 py-0.5 text-[11px] text-muted-foreground"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Row */}
                <div className="mt-1 flex items-center justify-between border-t pt-3">
                  <div className="text-xs text-muted-foreground">
                    Uploaded by <span className="font-medium text-foreground">{res.uploader.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
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
  );
}
