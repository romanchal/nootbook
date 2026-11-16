import Link from "next/link";
import { requireAppUser } from "@/features/auth/guards";
import { getUserBookmarks } from "@/features/library/bookmarks";
import { formatFileSize, RESOURCE_TYPE_META } from "@/features/library/format";
import { ResourceDownloadButton } from "@/features/library/download-button";
import { BookmarkButton } from "@/features/library/bookmark-button";
import { buttonVariants } from "@/components/ui/button";
import { AppNavbar } from "@/components/layout/app-navbar";
import type { ResourceType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
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

  const bookmarks = await getUserBookmarks(collegeId, user.id);

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
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/library" className="hover:text-foreground transition-colors">
            Library
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Saved Bookmarks</span>
        </nav>

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-500/5 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/20 mb-2">
                <span>🔖</span>
                <span>Personal Exam Revision Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Saved Bookmarks
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-lg">
                Your personal repository of saved question papers, practical files, and revision sheets.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <Link
                href="/library/search"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
              >
                <span>🔍 Search Library</span>
              </Link>
              <Link
                href="/library"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:from-amber-600 hover:to-amber-700 transition-all"
              >
                <span>Browse All →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bookmarks List */}
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-12 text-center bg-card/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-2xl text-amber-500">
              🔖
            </div>
            <h3 className="mt-3 text-sm font-bold text-foreground">No bookmarked resources yet</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Save university papers, lecture notes, and lab manuals for instant offline access and quick revision before exams.
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                href="/library"
                className={buttonVariants({ variant: "default", size: "sm", className: "bg-gradient-to-r from-amber-500 to-amber-600 font-semibold" })}
              >
                Browse Library →
              </Link>
              <Link
                href="/library/search"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Search Resources
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                <strong className="text-foreground font-semibold">{bookmarks.length}</strong> {bookmarks.length === 1 ? "saved resource" : "saved resources"}
              </span>
            </div>

            {bookmarks.map((item) => {
              const typeMeta = RESOURCE_TYPE_META[item.type as ResourceType];

              return (
                <article
                  key={item.id}
                  className="group relative rounded-2xl border border-border/80 bg-card p-5 shadow-2xs transition-all hover:border-amber-500/40 hover:shadow-md hover:-translate-y-0.5 space-y-3"
                >
                  {/* Meta Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                          typeMeta?.badgeClass ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {typeMeta?.label ?? item.type}
                      </span>

                      <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-foreground border border-border/60">
                        {item.department.code} · Sem {item.class.semester}
                      </span>

                      {item.academicYear && (
                        <span className="rounded-lg bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                          {item.academicYear}
                        </span>
                      )}

                      {item.verifiedBadge && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatFileSize(item.fileSize)}
                      </span>
                      <BookmarkButton
                        resourceId={item.id}
                        initialBookmarked={true}
                        size="icon-sm"
                      />
                    </div>
                  </div>

                  {/* Title & Subject Info */}
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                    <div className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1.5">
                      <Link
                        href={`/library/${item.department.code.toLowerCase()}/subject/${item.subject.id}`}
                        className="hover:underline hover:text-foreground font-medium"
                      >
                        📖 {item.subject.name}
                        {item.subject.code ? ` (${item.subject.code})` : ""}
                      </Link>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Action Row */}
                  <div className="flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="text-xs text-muted-foreground">
                      Uploaded by <span className="font-semibold text-foreground">{item.uploader.name}</span>
                    </span>

                    <ResourceDownloadButton
                      resourceId={item.id}
                      initialDownloads={item.downloadCount}
                      fileName={item.fileName}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
