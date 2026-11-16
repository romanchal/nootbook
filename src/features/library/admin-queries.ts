import { db } from "@/lib/db";
import type { ResourceType } from "@/generated/prisma/client";

export interface CreateResourceInput {
  collegeId: string;
  departmentId: string;
  classId: string;
  subjectId: string;
  uploaderId: string;
  type: ResourceType;
  title: string;
  description?: string | null;
  fileName: string;
  fileKey: string;
  mimeType: string;
  fileSize: number;
  academicYear?: string | null;
  examType?: string | null;
  tags?: string[];
}

/**
 * Creates a new resource with status = PENDING.
 * Golden rule: Every upload starts as pending; never visible to students until approved.
 */
export async function createPendingResource(input: CreateResourceInput) {
  const {
    collegeId,
    departmentId,
    classId,
    subjectId,
    uploaderId,
    type,
    title,
    description,
    fileName,
    fileKey,
    mimeType,
    fileSize,
    academicYear,
    examType,
    tags = [],
  } = input;

  return db.$transaction(async (tx) => {
    const resource = await tx.resource.create({
      data: {
        collegeId,
        departmentId,
        classId,
        subjectId,
        uploaderId,
        type,
        title,
        description: description || null,
        fileName,
        fileKey,
        mimeType,
        fileSize,
        academicYear: academicYear || null,
        examType: examType || null,
        status: "PENDING",
        verifiedBadge: false,
      },
    });

    if (tags.length > 0) {
      await tx.resourceTag.createMany({
        data: tags.map((name) => ({
          resourceId: resource.id,
          name,
        })),
      });
    }

    return resource;
  });
}

/**
 * Returns pending uploads for Class Admin moderation queue.
 * Scoped to the college (and optionally classId).
 */
export async function getPendingUploadsQueue(collegeId: string, classId?: string) {
  return db.resource.findMany({
    where: {
      collegeId,
      status: "PENDING",
      ...(classId ? { classId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      subject: true,
      department: true,
      class: true,
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      tags: true,
    },
  });
}

/**
 * Returns summary moderation counts for Class Admin dashboard cards.
 */
export async function getClassModerationCounts(collegeId: string, classId?: string) {
  const [pending, approved, rejected] = await Promise.all([
    db.resource.count({
      where: { collegeId, status: "PENDING", ...(classId ? { classId } : {}) },
    }),
    db.resource.count({
      where: { collegeId, status: "APPROVED", ...(classId ? { classId } : {}) },
    }),
    db.resource.count({
      where: { collegeId, status: "REJECTED", ...(classId ? { classId } : {}) },
    }),
  ]);

  return { pending, approved, rejected };
}

/**
 * Approves a pending resource:
 * - Updates status to APPROVED
 * - Awards verifiedBadge = true
 * - Records approvedById and approvedAt
 * - Writes an immutable AuditLog entry
 */
export async function approveResource(input: {
  collegeId: string;
  adminId: string;
  resourceId: string;
}) {
  const { collegeId, adminId, resourceId } = input;

  return db.$transaction(async (tx) => {
    const resource = await tx.resource.update({
      where: { id: resourceId, collegeId, status: "PENDING" },
      data: {
        status: "APPROVED",
        verifiedBadge: true,
        approvedById: adminId,
        approvedAt: new Date(),
        rejectionReason: null,
      },
    });

    await tx.auditLog.create({
      data: {
        collegeId,
        actorId: adminId,
        action: "RESOURCE_APPROVE",
        entity: "Resource",
        entityId: resourceId,
        metadata: {
          title: resource.title,
          type: resource.type,
          subjectId: resource.subjectId,
        },
      },
    });

    return resource;
  });
}

/**
 * Rejects a pending resource:
 * - Updates status to REJECTED
 * - Records rejectionReason and approvedById (as the reviewer)
 * - Writes an immutable AuditLog entry with reason
 */
export async function rejectResource(input: {
  collegeId: string;
  adminId: string;
  resourceId: string;
  reason: string;
}) {
  const { collegeId, adminId, resourceId, reason } = input;

  return db.$transaction(async (tx) => {
    const resource = await tx.resource.update({
      where: { id: resourceId, collegeId, status: "PENDING" },
      data: {
        status: "REJECTED",
        verifiedBadge: false,
        approvedById: adminId,
        rejectionReason: reason,
      },
    });

    await tx.auditLog.create({
      data: {
        collegeId,
        actorId: adminId,
        action: "RESOURCE_REJECT",
        entity: "Resource",
        entityId: resourceId,
        metadata: {
          title: resource.title,
          reason,
        },
      },
    });

    return resource;
  });
}
