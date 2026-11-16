import { db } from "@/lib/db";
import type { ResourceType } from "@/generated/prisma/client";

/**
 * Returns all active departments for a college, including the count of subjects.
 * Multi-tenant: strictly filtered by `collegeId`.
 */
export async function getCollegeDepartments(
  collegeId: string,
  options?: { includeAll?: boolean },
) {
  const where = options?.includeAll ? { collegeId } : { collegeId, active: true };
  return db.department.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          subjects: true,
          resources: { where: { status: "APPROVED" } },
        },
      },
    },
  });
}

/**
 * Returns a department by its code (e.g. "COMP") within a college,
 * along with its available classes/semesters.
 */
export async function getDepartmentWithClasses(
  collegeId: string,
  deptCode: string,
  options?: { allowInactive?: boolean },
) {
  const where = options?.allowInactive
    ? { collegeId, code: deptCode.toUpperCase() }
    : { collegeId, code: deptCode.toUpperCase(), active: true };

  return db.department.findFirst({
    where,
    include: {
      classes: {
        orderBy: [{ year: "asc" }, { semester: "asc" }],
        include: {
          _count: {
            select: {
              subjects: true,
              resources: { where: { status: "APPROVED" } },
            },
          },
        },
      },
    },
  });
}

/**
 * Returns all subjects for a given department and semester within a college.
 */
export async function getSemesterSubjects(
  collegeId: string,
  deptCode: string,
  semester: number,
) {
  const department = await db.department.findFirst({
    where: { collegeId, code: deptCode.toUpperCase(), active: true },
  });

  if (!department) return null;

  const classRecord = await db.class.findFirst({
    where: {
      collegeId,
      departmentId: department.id,
      semester,
    },
  });

  if (!classRecord) {
    return {
      department,
      classRecord: null,
      subjects: [],
    };
  }

  const subjects = await db.subject.findMany({
    where: {
      collegeId,
      departmentId: department.id,
      classId: classRecord.id,
      active: true,
    },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          resources: { where: { status: "APPROVED" } },
        },
      },
    },
  });

  return {
    department,
    classRecord,
    subjects,
  };
}

/**
 * Returns a subject and its approved resources within a college.
 * Optional filter by ResourceType.
 */
export async function getSubjectResources(
  collegeId: string,
  subjectId: string,
  typeFilter?: ResourceType,
) {
  const subject = await db.subject.findFirst({
    where: { id: subjectId, collegeId, active: true },
    include: {
      department: true,
      class: true,
    },
  });

  if (!subject) return null;

  const resources = await db.resource.findMany({
    where: {
      collegeId,
      subjectId,
      status: "APPROVED",
      ...(typeFilter ? { type: typeFilter } : {}),
    },
    orderBy: [{ academicYear: "desc" }, { createdAt: "desc" }],
    include: {
      tags: true,
      uploader: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    subject,
    resources,
  };
}

/**
 * Increments download count and returns resource download details.
 */
export async function recordResourceDownload(collegeId: string, resourceId: string) {
  return db.resource.update({
    where: { id: resourceId, collegeId, status: "APPROVED" },
    data: {
      downloadCount: { increment: 1 },
    },
    select: {
      id: true,
      fileKey: true,
      fileName: true,
      mimeType: true,
      downloadCount: true,
    },
  });
}
