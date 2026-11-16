import { db } from "@/lib/db";
import type { Prisma, ReportStatus } from "@/generated/prisma/client";

export interface ResolveReportInput {
  reportId: string;
  adminId: string;
  collegeId?: string | null; // Nullable for Super Admin; required for College/Class Admin
  status: "RESOLVED" | "DISMISSED";
  note?: string;
  takedownResource?: boolean;
}

/**
 * Retrieves submitted reports with associated resource and reporter details.
 */
export async function getAdminReports(
  collegeId?: string | null,
  status?: ReportStatus,
) {
  const where: Prisma.ReportWhereInput = {};
  if (collegeId) {
    where.collegeId = collegeId;
  }
  if (status) {
    where.status = status;
  }

  return db.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      reportedBy: { select: { id: true, name: true, email: true } },
      resolvedBy: { select: { id: true, name: true } },
      college: { select: { id: true, name: true, slug: true } },
      resource: {
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          fileName: true,
          department: { select: { name: true, code: true } },
          subject: { select: { name: true, code: true } },
          uploader: { select: { id: true, name: true } },
        },
      },
    },
  });
}

/**
 * Resolves or dismisses an open report.
 * If takedownResource is true, marks the resource as REJECTED and takes it down from student view.
 * Logs every action in AuditLog.
 */
export async function resolveReport(input: ResolveReportInput) {
  const { reportId, adminId, collegeId, status, note, takedownResource } = input;

  return db.$transaction(async (tx) => {
    // 1. Fetch report and verify college scoping if tenant-scoped admin
    const report = await tx.report.findUnique({
      where: { id: reportId },
      include: { resource: true },
    });

    if (!report) {
      throw new Error("Report not found.");
    }

    if (collegeId && report.collegeId !== collegeId) {
      throw new Error("Access denied: Report belongs to another college.");
    }

    let resourceTakedownPerformed = false;

    // 2. If takedown is requested on a reported resource, mark it REJECTED
    if (takedownResource && report.resourceId && report.resource) {
      await tx.resource.update({
        where: { id: report.resourceId },
        data: {
          status: "REJECTED",
          verifiedBadge: false,
          rejectionReason: `Takedown via admin report resolution: ${note || report.reason}`,
        },
      });

      await tx.auditLog.create({
        data: {
          collegeId: report.collegeId,
          actorId: adminId,
          action: "RESOURCE_TAKEDOWN",
          entity: "Resource",
          entityId: report.resourceId,
          metadata: {
            reportId: report.id,
            reason: report.reason,
            adminNote: note,
            previousStatus: report.resource.status,
          },
        },
      });

      resourceTakedownPerformed = true;
    }

    // 3. Update report status
    const updatedReport = await tx.report.update({
      where: { id: reportId },
      data: {
        status,
        resolvedById: adminId,
        note: note || null,
      },
    });

    // 4. Log report resolution in AuditLog
    await tx.auditLog.create({
      data: {
        collegeId: report.collegeId,
        actorId: adminId,
        action: status === "RESOLVED" ? "REPORT_RESOLVE" : "REPORT_DISMISS",
        entity: "Report",
        entityId: report.id,
        metadata: {
          status,
          reportedReason: report.reason,
          adminNote: note,
          takedown: resourceTakedownPerformed,
          resourceId: report.resourceId,
        },
      },
    });

    return updatedReport;
  });
}
