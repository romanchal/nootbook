import { describe, expect, it, vi } from "vitest";

const taskCreateMock = vi.fn();
const taskUpdateMock = vi.fn();
const taskFindFirstMock = vi.fn();

const bidCreateMock = vi.fn();
const bidUpdateMock = vi.fn();
const bidUpdateManyMock = vi.fn();
const bidFindFirstMock = vi.fn();

const reviewCreateMock = vi.fn();
const reviewFindUniqueMock = vi.fn();

const auditCreateMock = vi.fn();

vi.mock("@/lib/db", () => {
  interface MockDb {
    $transaction: (callback: (tx: MockDb) => Promise<unknown>) => Promise<unknown>;
    [key: string]: unknown;
  }
  const mockDb: MockDb = {
    $transaction: async (callback: (tx: MockDb) => Promise<unknown>) => callback(mockDb),
    task: {
      create: (...args: unknown[]) => taskCreateMock(...args),
      update: (...args: unknown[]) => taskUpdateMock(...args),
      findFirst: (...args: unknown[]) => taskFindFirstMock(...args),
    },
    bid: {
      create: (...args: unknown[]) => bidCreateMock(...args),
      update: (...args: unknown[]) => bidUpdateMock(...args),
      updateMany: (...args: unknown[]) => bidUpdateManyMock(...args),
      findFirst: (...args: unknown[]) => bidFindFirstMock(...args),
    },
    review: {
      create: (...args: unknown[]) => reviewCreateMock(...args),
      findUnique: (...args: unknown[]) => reviewFindUniqueMock(...args),
    },
    auditLog: {
      create: (...args: unknown[]) => auditCreateMock(...args),
    },
  };
  return { db: mockDb };
});

import {
  createTask,
  createBid,
  withdrawBid,
  assignTask,
  deliverTask,
  acceptTaskDelivery,
  submitTaskReview,
  cancelTask,
} from "./lifecycle";
import {
  containsAcademicIntegrityViolation,
  createTaskSchema,
  createBidSchema,
  deliverTaskSchema,
  reviewTaskSchema,
} from "./schemas";

describe("Task Marketplace (Step 7 Acceptance Criteria)", () => {
  describe("Academic Integrity & Validation Schemas", () => {
    it("detects and rejects exam cheating keywords", () => {
      expect(containsAcademicIntegrityViolation("Need someone for exam help in maths")).toBe(true);
      expect(containsAcademicIntegrityViolation("Please take my exam for me")).toBe(true);
      expect(containsAcademicIntegrityViolation("Looking to cheat in test")).toBe(true);
      expect(containsAcademicIntegrityViolation("Proxy attendance needed")).toBe(true);
      expect(containsAcademicIntegrityViolation("Impersonate student in viva")).toBe(true);

      // Legitimate assistance should pass
      expect(containsAcademicIntegrityViolation("Format IEEE paper on database indexing")).toBe(false);
      expect(containsAcademicIntegrityViolation("Need tutoring on binary search trees")).toBe(false);
      expect(containsAcademicIntegrityViolation("Draw digital circuit schematic in Proteus")).toBe(false);
    });

    it("validates task creation payload and rejects cheating titles", () => {
      const valid = createTaskSchema.safeParse({
        type: "FORMATTING",
        title: "Format unit 4 practical record in Word",
        description: "Need margins, header, and table of contents formatted.",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        budgetRupees: 250,
      });
      expect(valid.success).toBe(true);

      const invalidTitle = createTaskSchema.safeParse({
        type: "FORMATTING",
        title: "Exam help needed urgently",
        description: "Please help during internal test",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        budgetRupees: 250,
      });
      expect(invalidTitle.success).toBe(false);
    });

    it("enforces minimum budget and future deadline", () => {
      const tooLow = createTaskSchema.safeParse({
        type: "TYPING",
        title: "Type handwritten notes",
        description: "Three pages of class notes to transcribe.",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        budgetRupees: 20, // Min is 50
      });
      expect(tooLow.success).toBe(false);

      const pastDeadline = createTaskSchema.safeParse({
        type: "TYPING",
        title: "Type handwritten notes",
        description: "Three pages of class notes to transcribe.",
        deadline: new Date(Date.now() - 1000).toISOString(),
        budgetRupees: 100,
      });
      expect(pastDeadline.success).toBe(false);
    });

    it("validates bid, delivery, and review schemas", () => {
      expect(createBidSchema.safeParse({ taskId: "t1", amountRupees: 200 }).success).toBe(true);
      expect(createBidSchema.safeParse({ taskId: "t1", amountRupees: 10 }).success).toBe(false);

      expect(
        deliverTaskSchema.safeParse({
          taskId: "t1",
          deliveryNotes: "Here is the completed document formatting link.",
        }).success,
      ).toBe(true);
      expect(deliverTaskSchema.safeParse({ taskId: "t1", deliveryNotes: "hi" }).success).toBe(false);

      expect(reviewTaskSchema.safeParse({ taskId: "t1", rating: 5, comment: "Great work!" }).success).toBe(
        true,
      );
      expect(reviewTaskSchema.safeParse({ taskId: "t1", rating: 6 }).success).toBe(false);
    });
  });

  describe("End-to-End Task Lifecycle Execution", () => {
    const collegeId = "col-nagpur-1";
    const studentId = "student-1";
    const earnerId = "earner-1";
    const taskId = "task-101";
    const bidId = "bid-202";

    it("Step 1: Student creates task with status OPEN and logs TASK_CREATE in AuditLog", async () => {
      const futureDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);
      taskCreateMock.mockResolvedValueOnce({
        id: taskId,
        collegeId,
        studentId,
        type: "FORMATTING",
        title: "Format DBMS lab report",
        budgetPaise: 30000,
        deadline: futureDeadline,
        status: "OPEN",
      });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-1" });

      const task = await createTask({
        collegeId,
        studentId,
        type: "FORMATTING",
        title: "Format DBMS lab report",
        description: "Align margins and table of contents per college syllabus guidelines.",
        deadline: futureDeadline,
        budgetPaise: 30000,
      });

      expect(task.id).toBe(taskId);
      expect(task.status).toBe("OPEN");
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "TASK_CREATE",
            entity: "Task",
            entityId: taskId,
          }),
        }),
      );
    });

    it("Step 2: Verified Earner submits bid on task and logs BID_SUBMIT in AuditLog", async () => {
      taskFindFirstMock.mockResolvedValueOnce({
        id: taskId,
        collegeId,
        studentId,
        status: "OPEN",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      bidFindFirstMock.mockResolvedValueOnce(null);
      bidCreateMock.mockResolvedValueOnce({
        id: bidId,
        taskId,
        earnerId,
        amountPaise: 28000,
        status: "PENDING",
      });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-2" });

      const bid = await createBid({
        collegeId,
        earnerId,
        taskId,
        amountPaise: 28000,
        message: "I can deliver this cleanly formatted in LaTeX within 24 hours.",
      });

      expect(bid.id).toBe(bidId);
      expect(bid.status).toBe("PENDING");
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "BID_SUBMIT",
            entity: "Bid",
            entityId: bidId,
          }),
        }),
      );
    });

    it("Step 2b: Prevents student from bidding on their own task", async () => {
      taskFindFirstMock.mockResolvedValueOnce({
        id: taskId,
        collegeId,
        studentId,
        status: "OPEN",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await expect(
        createBid({
          collegeId,
          earnerId: studentId, // same as studentId!
          taskId,
          amountPaise: 20000,
        }),
      ).rejects.toThrow(/You cannot bid on your own task/);
    });

    it("Step 3: Earner can withdraw a pending bid", async () => {
      bidFindFirstMock.mockResolvedValueOnce({
        id: bidId,
        earnerId,
        status: "PENDING",
        taskId,
      });
      bidUpdateMock.mockResolvedValueOnce({ id: bidId, status: "WITHDRAWN" });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-3" });

      const res = await withdrawBid(collegeId, earnerId, bidId);
      expect(res.status).toBe("WITHDRAWN");
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "BID_WITHDRAW",
            entity: "Bid",
          }),
        }),
      );
    });

    it("Step 4: Student assigns task: updates task to ASSIGNED, accepts winning bid, rejects others, logs TASK_ASSIGN", async () => {
      taskFindFirstMock.mockResolvedValueOnce({
        id: taskId,
        collegeId,
        studentId,
        status: "OPEN",
      });
      bidFindFirstMock.mockResolvedValueOnce({
        id: bidId,
        taskId,
        status: "PENDING",
        earnerId,
        amountPaise: 28000,
        earner: { id: earnerId, name: "Pranav" },
      });
      taskUpdateMock.mockResolvedValueOnce({
        id: taskId,
        status: "ASSIGNED",
        earnerId,
      });
      bidUpdateMock.mockResolvedValueOnce({ id: bidId, status: "ACCEPTED" });
      bidUpdateManyMock.mockResolvedValueOnce({ count: 2 });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-4" });

      const assigned = await assignTask({
        collegeId,
        studentId,
        taskId,
        bidId,
      });

      expect(assigned.status).toBe("ASSIGNED");
      expect(assigned.earnerId).toBe(earnerId);

      expect(bidUpdateMock).toHaveBeenCalledWith({
        where: { id: bidId },
        data: { status: "ACCEPTED" },
      });
      expect(bidUpdateManyMock).toHaveBeenCalledWith({
        where: {
          taskId,
          id: { not: bidId },
          status: "PENDING",
        },
        data: { status: "REJECTED" },
      });
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "TASK_ASSIGN",
            entity: "Task",
            entityId: taskId,
          }),
        }),
      );
    });

    it("Step 5: Earner delivers work: status transitions to DELIVERED and logs TASK_DELIVER", async () => {
      taskFindFirstMock.mockResolvedValueOnce({
        id: taskId,
        collegeId,
        earnerId,
        status: "ASSIGNED",
      });
      taskUpdateMock.mockResolvedValueOnce({ id: taskId, status: "DELIVERED" });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-5" });

      const delivered = await deliverTask({
        collegeId,
        earnerId,
        taskId,
        deliveryNotes: "https://drive.google.com/file/d/123 - Formatted report per guidelines.",
      });

      expect(delivered.status).toBe("DELIVERED");
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "TASK_DELIVER",
            entity: "Task",
            entityId: taskId,
            metadata: expect.objectContaining({
              deliveryNotes: expect.stringContaining("drive.google.com"),
            }),
          }),
        }),
      );
    });

    it("Step 6: Student accepts delivery: status transitions to ACCEPTED and logs TASK_ACCEPT", async () => {
      taskFindFirstMock.mockResolvedValueOnce({
        id: taskId,
        collegeId,
        studentId,
        earnerId,
        status: "DELIVERED",
      });
      taskUpdateMock.mockResolvedValueOnce({ id: taskId, status: "ACCEPTED" });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-6" });

      const accepted = await acceptTaskDelivery({
        collegeId,
        studentId,
        taskId,
      });

      expect(accepted.status).toBe("ACCEPTED");
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "TASK_ACCEPT",
            entity: "Task",
            entityId: taskId,
          }),
        }),
      );
    });

    it("Step 7: Student submits review (1-5 stars) and logs TASK_REVIEW", async () => {
      taskFindFirstMock.mockResolvedValueOnce({
        id: taskId,
        collegeId,
        studentId,
        earnerId,
        status: "ACCEPTED",
      });
      reviewFindUniqueMock.mockResolvedValueOnce(null);
      reviewCreateMock.mockResolvedValueOnce({
        id: "rev-1",
        taskId,
        reviewerId: studentId,
        earnerId,
        rating: 5,
        comment: "Excellent formatting, delivered ahead of time!",
      });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-7" });

      const review = await submitTaskReview({
        collegeId,
        studentId,
        taskId,
        rating: 5,
        comment: "Excellent formatting, delivered ahead of time!",
      });

      expect(review.rating).toBe(5);
      expect(reviewCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskId,
            collegeId,
            reviewerId: studentId,
            earnerId,
            rating: 5,
          }),
        }),
      );
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "TASK_REVIEW",
            entity: "Review",
            entityId: "rev-1",
          }),
        }),
      );
    });

    it("Step 8: Task cancellation is allowed only while OPEN and logs TASK_CANCEL", async () => {
      taskFindFirstMock.mockResolvedValueOnce({
        id: taskId,
        collegeId,
        studentId,
        status: "OPEN",
      });
      taskUpdateMock.mockResolvedValueOnce({ id: taskId, status: "CANCELLED" });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-8" });

      const cancelled = await cancelTask({
        collegeId,
        studentId,
        taskId,
      });

      expect(cancelled.status).toBe("CANCELLED");
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "TASK_CANCEL",
            entity: "Task",
            entityId: taskId,
          }),
        }),
      );
    });

    it("Step 8b: Rejects cancellation if task is already ASSIGNED", async () => {
      taskFindFirstMock.mockResolvedValueOnce({
        id: taskId,
        collegeId,
        studentId,
        status: "ASSIGNED",
      });

      await expect(
        cancelTask({
          collegeId,
          studentId,
          taskId,
        }),
      ).rejects.toThrow(/Only open tasks with no assigned earner can be cancelled/);
    });
  });
});
