"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatFileSize, RESOURCE_TYPE_META } from "@/features/library/format";
import { ResourceDownloadButton } from "@/features/library/download-button";
import { BookmarkButton } from "@/features/library/bookmark-button";
import { Button } from "@/components/ui/button";
import type { ResourceType } from "@/generated/prisma/client";
import type { SearchResultItem } from "./search";

interface SearchFilterOptions {
  departments: Array<{ code: string; name: string }>;
  semesters: number[];
  resourceTypes: ResourceType[];
}

interface SearchInterfaceProps {
  initialQuery?: string;
  initialDept?: string;
  initialSem?: number;
  initialType?: ResourceType;
  initialVerified?: boolean;
  results: SearchResultItem[];
  total: number;
  durationMs: number;
  filterOptions: SearchFilterOptions;
  bookmarkedIds: string[];
}

export function SearchInterface({
  initialQuery = "",
  initialDept = "",
  initialSem,
  initialType,
  initialVerified = false,
  results,
  total,
  durationMs,
  filterOptions,
  bookmarkedIds,
}: SearchInterfaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const bookmarkedSet = new Set(bookmarkedIds);

  function updateFilter(updates: Record<string, string | number | boolean | null | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    updateFilter({ q: q?.trim() || null });
  }

  function handleReset() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  const hasActiveFilters = Boolean(
    initialQuery || initialDept || initialSem || initialType || initialVerified,
  );

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <input
          type="search"
          name="q"
          defaultValue={initialQuery}
          placeholder="Search by subject, title (e.g. DBMS, DSA), unit, exam, or tag..."
          className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-24 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
        />
        <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
          <Button type="submit" size="sm" disabled={isPending} className="h-9 px-3">
            {isPending ? "Searching…" : "Search"}
          </Button>
        </div>
      </form>

      {/* Filter Control Bar */}
      <div className="rounded-xl border bg-card/60 p-4 shadow-2xs backdrop-blur-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Department</label>
            <select
              value={initialDept}
              onChange={(e) => updateFilter({ dept: e.target.value || null })}
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="w-32">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Semester</label>
            <select
              value={initialSem ?? ""}
              onChange={(e) => updateFilter({ sem: e.target.value ? Number(e.target.value) : null })}
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="">All Semesters</option>
              {filterOptions.semesters.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Resource Type Filter */}
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Category</label>
            <select
              value={initialType ?? ""}
              onChange={(e) => updateFilter({ type: (e.target.value as ResourceType) || null })}
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="">All Categories</option>
              {filterOptions.resourceTypes.map((t) => (
                <option key={t} value={t}>
                  {RESOURCE_TYPE_META[t]?.label ?? t}
                </option>
              ))}
            </select>
          </div>

          {/* Verified Only Toggle */}
          <div className="flex items-end pb-1.5 pt-2">
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={initialVerified}
                onChange={(e) => updateFilter({ verified: e.target.checked ? "true" : null })}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="text-xs font-medium text-foreground flex items-center gap-1">
                <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Verified Only
              </span>
            </label>
          </div>

          {/* Reset button */}
          {hasActiveFilters && (
            <div className="flex items-end pb-1.5">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Speed & Results Meta Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-2">
          <span>
            Found <strong className="text-foreground font-semibold">{total}</strong> {total === 1 ? "resource" : "resources"}
          </span>
          {hasActiveFilters && (
            <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono">
              filtered
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{durationMs} ms</span>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center bg-card/40">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">No resources matched your search</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Try adjusting your query, selecting a different department, or clearing the verified-only filter.
            </p>
            {hasActiveFilters && (
              <Button onClick={handleReset} variant="outline" size="sm" className="mt-4 text-xs">
                Reset all filters
              </Button>
            )}
          </div>
        ) : (
          results.map((item) => {
            const typeMeta = RESOURCE_TYPE_META[item.type];
            const isBookmarked = bookmarkedSet.has(item.id);

            return (
              <article
                key={item.id}
                className="group relative rounded-xl border bg-card p-4 shadow-2xs transition-all hover:border-foreground/20 hover:shadow-xs space-y-3"
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                        typeMeta?.badgeClass ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {typeMeta?.label ?? item.type}
                    </span>

                    <span className="rounded bg-muted/80 px-2 py-0.5 text-xs font-medium text-foreground">
                      {item.department.code} · Sem {item.class.semester}
                    </span>

                    {item.academicYear && (
                      <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        {item.academicYear}
                      </span>
                    )}

                    {item.verifiedBadge && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatFileSize(item.fileSize)}
                    </span>
                    <BookmarkButton
                      resourceId={item.id}
                      initialBookmarked={isBookmarked}
                      size="icon-sm"
                    />
                  </div>
                </div>

                {/* Title & Subject Info */}
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <div className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1.5">
                    <Link
                      href={`/library/${item.department.code.toLowerCase()}/subject/${item.subject.id}`}
                      className="hover:underline hover:text-foreground font-medium"
                    >
                      {item.subject.name}
                      {item.subject.code ? ` (${item.subject.code})` : ""}
                    </Link>
                  </div>
                  {item.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
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
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-muted-foreground">
                    Uploaded by <span className="font-medium text-foreground">{item.uploader.name}</span>
                  </span>

                  <ResourceDownloadButton
                    resourceId={item.id}
                    initialDownloads={item.downloadCount}
                    fileName={item.fileName}
                  />
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
