import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export interface AuditLogInput {
  collegeId?: string | null;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}

/**
 * Creates an immutable record in the audit log for any administrative action.
 * Golden rule: Every admin action, role change, content takedown, or config update must be logged.
 */
export async function createAuditLogEntry(data: AuditLogInput) {
  return db.auditLog.create({
    data: {
      collegeId: data.collegeId ?? null,
      actorId: data.actorId,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      metadata: data.metadata ?? undefined,
      ipAddress: data.ipAddress ?? null,
    },
  });
}

export interface GetAuditLogsOptions {
  collegeId?: string | null;
  actorId?: string;
  entity?: string;
  action?: string;
  limit?: number;
}

/**
 * Retrieves audit logs ordered chronologically by newest first.
 * For tenant isolation: College/Class Admins must pass collegeId to restrict scope.
 * Super Admins may pass null/undefined to view platform-wide events.
 */
export async function getAuditLogs(options: GetAuditLogsOptions = {}) {
  const { collegeId, actorId, entity, action, limit = 50 } = options;

  const where: Prisma.AuditLogWhereInput = {};
  if (collegeId) {
    where.collegeId = collegeId;
  }
  if (actorId) {
    where.actorId = actorId;
  }
  if (entity) {
    where.entity = entity;
  }
  if (action) {
    where.action = action;
  }

  return db.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: { select: { id: true, name: true, email: true } },
      college: { select: { id: true, name: true, slug: true } },
    },
  });
}
