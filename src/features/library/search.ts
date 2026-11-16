import { db } from "@/lib/db";
import { RESOURCE_TYPE_META } from "@/features/library/format";
import type { Prisma, ResourceType } from "@/generated/prisma/client";

export interface SearchFilters {
  query?: string;
  deptCode?: string;
  semester?: number;
  type?: ResourceType;
  academicYear?: string;
  verifiedOnly?: boolean;
}

export interface SearchResultItem {
  id: string;
  title: string;
  description: string | null;
  type: ResourceType;
  fileName: string;
  fileSize: number;
  academicYear: string | null;
  examType: string | null;
  verifiedBadge: boolean;
  downloadCount: number;
  createdAt: Date;
  subject: {
    id: string;
    name: string;
    code: string | null;
  };
  department: {
    name: string;
    code: string;
  };
  class: {
    semester: number;
  };
  uploader: {
    id: string;
    name: string;
  };
  tags: Array<{ id: string; name: string }>;
}

export interface SearchResponse {
  items: SearchResultItem[];
  total: number;
  durationMs: number;
}

/**
 * Searches approved academic resources strictly within the user's college.
 * Acceptance criteria: Fast response time (< 1s on pilot data) with multi-criteria filtering.
 */
export async function searchCollegeResources(
  collegeId: string,
  filters: SearchFilters = {},
): Promise<SearchResponse> {
  const startTime = performance.now();

  const whereClause: Prisma.ResourceWhereInput = {
    collegeId,
    status: "APPROVED",
  };

  // 1. Text search across title, description, fileName, tags, and subject
  if (filters.query && filters.query.trim().length > 0) {
    const q = filters.query.trim();
    whereClause.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { fileName: { contains: q, mode: "insensitive" } },
      { academicYear: { contains: q, mode: "insensitive" } },
      { examType: { contains: q, mode: "insensitive" } },
      { tags: { some: { name: { contains: q, mode: "insensitive" } } } },
      { subject: { name: { contains: q, mode: "insensitive" } } },
      { subject: { code: { contains: q, mode: "insensitive" } } },
    ];
  }

  // 2. Department filter
  if (filters.deptCode && filters.deptCode.trim().length > 0) {
    whereClause.department = {
      code: filters.deptCode.toUpperCase(),
      collegeId,
    };
  }

  // 3. Semester filter
  if (filters.semester && filters.semester >= 1 && filters.semester <= 8) {
    whereClause.class = {
      semester: filters.semester,
      collegeId,
    };
  }

  // 4. Resource Category filter
  if (filters.type) {
    whereClause.type = filters.type;
  }

  // 5. Academic Year filter
  if (filters.academicYear && filters.academicYear.trim().length > 0) {
    whereClause.academicYear = filters.academicYear.trim();
  }

  // 6. Verified only filter
  if (filters.verifiedOnly) {
    whereClause.verifiedBadge = true;
  }

  const [items, total] = await Promise.all([
    db.resource.findMany({
      where: whereClause,
      orderBy: [{ downloadCount: "desc" }, { createdAt: "desc" }],
      take: 50,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        department: { select: { name: true, code: true } },
        class: { select: { semester: true } },
        uploader: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
      },
    }),
    db.resource.count({ where: whereClause }),
  ]);

  const durationMs = Math.round(performance.now() - startTime);

  return {
    items,
    total,
    durationMs,
  };
}

/**
 * Returns available filter options (departments, semesters, resource types)
 * scoped to the college for the search interface.
 */
export async function getSearchFilterOptions(collegeId: string) {
  const departments = await db.department.findMany({
    where: { collegeId, active: true },
    select: { code: true, name: true },
    orderBy: { name: "asc" },
  });

  return {
    departments,
    semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    resourceTypes: Object.keys(RESOURCE_TYPE_META) as ResourceType[],
  };
}

