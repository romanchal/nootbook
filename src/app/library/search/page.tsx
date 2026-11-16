import Link from "next/link";
import { requireAppUser } from "@/features/auth/guards";
import { searchCollegeResources, getSearchFilterOptions } from "@/features/library/search";
import { getUserBookmarkedResourceIds } from "@/features/library/bookmarks";
import { SearchInterface } from "@/features/library/search-interface";
import { AppNavbar } from "@/components/layout/app-navbar";
import type { ResourceType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    dept?: string;
    sem?: string;
    type?: string;
    verified?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
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

  const resolvedParams = await searchParams;
  const q = resolvedParams.q?.trim() || "";
  const deptCode = resolvedParams.dept?.trim() || "";
  const semester = resolvedParams.sem ? parseInt(resolvedParams.sem, 10) : undefined;
  const type = resolvedParams.type ? (resolvedParams.type as ResourceType) : undefined;
  const verifiedOnly = resolvedParams.verified === "true";

  const [searchResponse, filterOptions, bookmarkedIds] = await Promise.all([
    searchCollegeResources(collegeId, {
      query: q || undefined,
      deptCode: deptCode || undefined,
      semester: semester && !isNaN(semester) ? semester : undefined,
      type,
      verifiedOnly,
    }),
    getSearchFilterOptions(collegeId),
    getUserBookmarkedResourceIds(collegeId, user.id),
  ]);

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
          <Link href="/library" className="hover:text-foreground transition-colors">
            Library
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Instant Search</span>
        </nav>

        {/* Page Heading Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-500/5 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-500/20 mb-2">
                <span>⚡</span>
                <span>Sub-Second Campus Search</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Academic Search
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-lg">
                Instantly query past papers, handwritten notes, and practical manuals across all departments.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <Link
                href="/library/bookmarks"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
              >
                <span>🔖 Saved Bookmarks</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <SearchInterface
          initialQuery={q}
          initialDept={deptCode}
          initialSem={semester}
          initialType={type}
          initialVerified={verifiedOnly}
          results={searchResponse.items}
          total={searchResponse.total}
          durationMs={searchResponse.durationMs}
          filterOptions={filterOptions}
          bookmarkedIds={bookmarkedIds}
        />
      </main>
    </div>
  );
}
