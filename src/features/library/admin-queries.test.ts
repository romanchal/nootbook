import { describe, expect, it, vi } from "vitest";

const resourceCreateMock = vi.fn();
const resourceUpdateMock = vi.fn();
const resourceFindManyMock = vi.fn();
const resourceCountMock = vi.fn();
const auditLogCreateMock = vi.fn();
const resourceTagCreateManyMock = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    $transaction: async (fn: (tx: unknown) => unknown) =>
      fn({
        resource: {
          create: resourceCreateMock,
          update: resourceUpdateMock,
          findMany: resourceFindManyMock,
          count: resourceCountMock,
        },
        auditLog: {
          create: auditLogCreateMock,
        },
        resourceTag: {
          createMany: resourceTagCreateManyMock,
        },
      }),
    resource: {
      findMany: (...args: unknown[]) => resourceFindManyMock(...args),
      count: (...args: unknown[]) => resourceCountMock(...args),
    },
  },
}));

import {
  approveResource,
  createPendingResource,
  getPendingUploadsQueue,
  rejectResource,
} from "./admin-queries";

describe("Class Admin Moderation & Upload Invariants", () => {
  it("enforces status=PENDING and verifiedBadge=false on new uploads", async () => {
    resourceCreateMock.mockResolvedValueOnce({
      id: "res-new-1",
      title: "Unit 2 Notes",
      status: "PENDING",
      verifiedBadge: false,
    });

    const created = await createPendingResource({
      collegeId: "pilot-college",
      departmentId: "dept-comp",
      classId: "class-sem3",
      subjectId: "sub-dsa",
      uploaderId: "student-1",
      type: "NOTES",
      title: "Unit 2 Notes",
      fileName: "notes.pdf",
      fileKey: "files/notes.pdf",
      mimeType: "application/pdf",
      fileSize: 1024000,
      tags: ["Algorithms", "Unit2"],
    });

    expect(resourceCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        collegeId: "pilot-college",
        status: "PENDING",
        verifiedBadge: false,
      }),
    });
    expect(resourceTagCreateManyMock).toHaveBeenCalledWith({
      data: [
        { resourceId: "res-new-1", name: "Algorithms" },
        { resourceId: "res-new-1", name: "Unit2" },
      ],
    });
    expect(created.status).toBe("PENDING");
  });

  it("filters only PENDING uploads for the Class Admin review queue", async () => {
    resourceFindManyMock.mockResolvedValueOnce([
      { id: "res-p1", title: "Pending Paper", status: "PENDING" },
    ]);

    const queue = await getPendingUploadsQueue("pilot-college", "class-sem3");
    expect(resourceFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          collegeId: "pilot-college",
          classId: "class-sem3",
          status: "PENDING",
        }),
      }),
    );
    expect(queue).toHaveLength(1);
  });

  it("approves pending uploads, awards verifiedBadge, and logs audit action", async () => {
    resourceUpdateMock.mockResolvedValueOnce({
      id: "res-p1",
      title: "Pending Paper",
      status: "APPROVED",
      verifiedBadge: true,
      subjectId: "sub-1",
      type: "OLD_PAPER",
    });

    const approved = await approveResource({
      collegeId: "pilot-college",
      adminId: "class-admin-1",
      resourceId: "res-p1",
    });

    expect(resourceUpdateMock).toHaveBeenCalledWith({
      where: { id: "res-p1", collegeId: "pilot-college", status: "PENDING" },
      data: expect.objectContaining({
        status: "APPROVED",
        verifiedBadge: true,
        approvedById: "class-admin-1",
      }),
    });

    expect(auditLogCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        collegeId: "pilot-college",
        actorId: "class-admin-1",
        action: "RESOURCE_APPROVE",
        entity: "Resource",
        entityId: "res-p1",
      }),
    });

    expect(approved.status).toBe("APPROVED");
    expect(approved.verifiedBadge).toBe(true);
  });

  it("rejects invalid uploads, records rejection reason, and logs audit action", async () => {
    resourceUpdateMock.mockResolvedValueOnce({
      id: "res-p2",
      title: "Bad Scan",
      status: "REJECTED",
      verifiedBadge: false,
    });

    const rejected = await rejectResource({
      collegeId: "pilot-college",
      adminId: "class-admin-1",
      resourceId: "res-p2",
      reason: "Pages are illegible. Please scan with flat lighting.",
    });

    expect(resourceUpdateMock).toHaveBeenCalledWith({
      where: { id: "res-p2", collegeId: "pilot-college", status: "PENDING" },
      data: expect.objectContaining({
        status: "REJECTED",
        verifiedBadge: false,
        rejectionReason: "Pages are illegible. Please scan with flat lighting.",
      }),
    });

    expect(auditLogCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        collegeId: "pilot-college",
        actorId: "class-admin-1",
        action: "RESOURCE_REJECT",
        entity: "Resource",
        entityId: "res-p2",
      }),
    });

    expect(rejected.status).toBe("REJECTED");
  });
});
