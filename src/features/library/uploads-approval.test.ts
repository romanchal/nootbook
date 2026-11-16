import { describe, expect, it, vi } from "vitest";

interface MockResource {
  id: string;
  collegeId?: string;
  subjectId?: string;
  status?: string;
  title?: string;
  verifiedBadge?: boolean;
  rejectionReason?: string | null;
  [key: string]: unknown;
}

interface MockAuditLog {
  collegeId: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: unknown;
}

let mockResources: MockResource[] = [];
let mockAuditLogs: MockAuditLog[] = [];

vi.mock("@/lib/db", () => ({
  db: {
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        resource: {
          create: vi.fn(async ({ data }: { data: Omit<MockResource, "id"> }) => {
            const res = { id: `res-${Date.now()}`, ...data };
            mockResources.push(res);
            return res;
          }),
          update: vi.fn(
            async ({
              where,
              data,
            }: {
              where: { id: string; collegeId: string };
              data: Partial<MockResource>;
            }) => {
              const index = mockResources.findIndex(
                (r) => r.id === where.id && r.collegeId === where.collegeId,
              );
              if (index === -1) throw new Error("Resource not found");
              mockResources[index] = { ...mockResources[index], ...data };
              return mockResources[index];
            },
          ),
        },
        resourceTag: {
          createMany: vi.fn(),
        },
        auditLog: {
          create: vi.fn(async ({ data }: { data: MockAuditLog }) => {
            mockAuditLogs.push(data);
            return data;
          }),
        },
      }),
    resource: {
      findMany: vi.fn(
        async ({
          where,
        }: {
          where: { collegeId?: string; status?: string; subjectId?: string };
        }) => {
          return mockResources.filter((r) => {
            if (where.collegeId && r.collegeId !== where.collegeId) return false;
            if (where.status && r.status !== where.status) return false;
            if (where.subjectId && r.subjectId !== where.subjectId) return false;
            return true;
          });
        },
      ),
    },
    subject: {
      findFirst: vi.fn(async ({ where }: { where: { id: string; collegeId: string } }) => ({
        id: where.id,
        collegeId: where.collegeId,
        department: { name: "Computer" },
        class: { semester: 3 },
      })),
    },
  },
}));

import {
  approveResource,
  createPendingResource,
  getPendingUploadsQueue,
  rejectResource,
} from "./admin-queries";
import { getSubjectResources } from "./queries";

describe("Step 4 Acceptance Criteria: Uploads & Class Admin Approval", () => {
  const collegeId = "pilot-college";
  const subjectId = "sub-dsa";

  it("ensures unapproved (PENDING) files are never visible to students browsing the library", async () => {
    mockResources = [];
    mockAuditLogs = [];

    // 1. Student uploads a file
    const pendingUpload = await createPendingResource({
      collegeId,
      departmentId: "dept-comp",
      classId: "class-sem3",
      subjectId,
      uploaderId: "student-1",
      type: "OLD_PAPER",
      title: "Mid-Sem DSA 2024 Exam Paper",
      fileName: "midsem-dsa.pdf",
      fileKey: "files/midsem-dsa.pdf",
      mimeType: "application/pdf",
      fileSize: 850000,
    });

    expect(pendingUpload.status).toBe("PENDING");
    expect(pendingUpload.verifiedBadge).toBe(false);

    // 2. Student queries the subject in the academic library
    const studentViewBeforeApproval = await getSubjectResources(collegeId, subjectId);
    expect(studentViewBeforeApproval).not.toBeNull();
    // Invariant: Unapproved files MUST NOT appear in the student's library view!
    expect(studentViewBeforeApproval?.resources).toHaveLength(0);

    // 3. Class Admin checks their review queue
    const classAdminQueue = await getPendingUploadsQueue(collegeId);
    expect(classAdminQueue).toHaveLength(1);
    expect(classAdminQueue[0].id).toBe(pendingUpload.id);

    // 4. Class Admin approves the file
    const approvedResource = await approveResource({
      collegeId,
      adminId: "class-admin-pilot",
      resourceId: pendingUpload.id,
    });

    expect(approvedResource.status).toBe("APPROVED");
    expect(approvedResource.verifiedBadge).toBe(true);
    expect(mockAuditLogs).toHaveLength(1);
    expect(mockAuditLogs[0].action).toBe("RESOURCE_APPROVE");

    // 5. Now the approved file is immediately live for students
    const studentViewAfterApproval = await getSubjectResources(collegeId, subjectId);
    expect(studentViewAfterApproval?.resources).toHaveLength(1);
    expect(studentViewAfterApproval?.resources[0].title).toBe("Mid-Sem DSA 2024 Exam Paper");
    expect(studentViewAfterApproval?.resources[0].verifiedBadge).toBe(true);
  });

  it("ensures REJECTED files are also never visible to students in the library", async () => {
    mockResources = [];
    mockAuditLogs = [];

    // Student uploads another file with an illegible scan
    const badUpload = await createPendingResource({
      collegeId,
      departmentId: "dept-comp",
      classId: "class-sem3",
      subjectId,
      uploaderId: "student-2",
      type: "NOTES",
      title: "Blurry Handwritten Notes",
      fileName: "blurry.pdf",
      fileKey: "files/blurry.pdf",
      mimeType: "application/pdf",
      fileSize: 500000,
    });

    // Class admin rejects it
    const rejected = await rejectResource({
      collegeId,
      adminId: "class-admin-pilot",
      resourceId: badUpload.id,
      reason: "Pages are illegible and cut off at the bottom.",
    });

    expect(rejected.status).toBe("REJECTED");
    expect(rejected.rejectionReason).toBe("Pages are illegible and cut off at the bottom.");

    // Student library view must still be empty
    const studentView = await getSubjectResources(collegeId, subjectId);
    expect(studentView?.resources).toHaveLength(0);
  });
});
