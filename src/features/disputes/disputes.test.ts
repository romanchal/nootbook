import { beforeEach, describe, expect, it, vi } from "vitest";

interface TestLedgerLeg {
  account: string;
  debitPaise: number;
  creditPaise: number;
  userId?: string | null;
}

const disputeCreateMock = vi.fn();
const disputeUpdateMock = vi.fn();
const disputeFindUniqueMock = vi.fn();
const disputeFindFirstMock = vi.fn();
const disputeFindManyMock = vi.fn();

const taskFindFirstMock = vi.fn();
const taskUpdateMock = vi.fn();

const escrowUpdateMock = vi.fn();

const userFindUniqueMock = vi.fn();
const userUpdateMock = vi.fn();

const walletUpdateManyMock = vi.fn();
const walletUpsertMock = vi.fn();

const ledgerCreateManyMock = vi.fn();
const auditCreateMock = vi.fn();
const auditCountMock = vi.fn();
const auditFindManyMock = vi.fn();
const configFindFirstMock = vi.fn();

vi.mock("@/lib/db", () => {
  interface MockDb {
    $transaction: (callback: (tx: MockDb) => Promise<unknown>) => Promise<unknown>;
    [key: string]: unknown;
  }
  const mockDb: MockDb = {
    $transaction: async (callback: (tx: MockDb) => Promise<unknown>) => callback(mockDb),
    dispute: {
      create: (...args: unknown[]) => disputeCreateMock(...args),
      update: (...args: unknown[]) => disputeUpdateMock(...args),
      findUnique: (...args: unknown[]) => disputeFindUniqueMock(...args),
      findFirst: (...args: unknown[]) => disputeFindFirstMock(...args),
      findMany: (...args: unknown[]) => disputeFindManyMock(...args),
    },
    task: {
      findFirst: (...args: unknown[]) => taskFindFirstMock(...args),
      update: (...args: unknown[]) => taskUpdateMock(...args),
    },
    escrowHold: {
      update: (...args: unknown[]) => escrowUpdateMock(...args),
    },
    user: {
      findUnique: (...args: unknown[]) => userFindUniqueMock(...args),
      update: (...args: unknown[]) => userUpdateMock(...args),
    },
    wallet: {
      updateMany: (...args: unknown[]) => walletUpdateManyMock(...args),
      upsert: (...args: unknown[]) => walletUpsertMock(...args),
    },
    ledgerEntry: {
      createMany: (...args: unknown[]) => ledgerCreateManyMock(...args),
    },
    auditLog: {
      create: (...args: unknown[]) => auditCreateMock(...args),
      count: (...args: unknown[]) => auditCountMock(...args),
      findMany: (...args: unknown[]) => auditFindManyMock(...args),
    },
    commissionConfig: {
      findFirst: (...args: unknown[]) => configFindFirstMock(...args),
    },
  };
  return { db: mockDb };
});

import { openDispute, resolveDispute } from "./service";
import { issueUserStrike, reinstateUser, verifyAcademicIntegrity } from "./safety";

describe("Step 9 — Disputes & Safety Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    configFindFirstMock.mockResolvedValue({
      id: "config-1",
      collegeId: "college-ycce",
      commissionBps: 1000, // 10%
      fixedFeePaise: 2000, // Rs. 20
    });
  });

  describe("Dispute Opening Workflow", () => {
    it("allows the task student to open a dispute on an ASSIGNED or DELIVERED task", async () => {
      taskFindFirstMock.mockResolvedValue({
        id: "task-1",
        collegeId: "college-ycce",
        studentId: "student-1",
        earnerId: "earner-1",
        title: "DSP Lab Manual Formatting",
        status: "DELIVERED",
        dispute: null,
        escrowHold: { id: "escrow-1", amountPaise: 52000, status: "HELD" },
      });

      disputeCreateMock.mockResolvedValue({
        id: "dispute-1",
        taskId: "task-1",
        collegeId: "college-ycce",
        openedById: "student-1",
        reason: "Delivered file is corrupted and missing section 3",
        status: "OPEN",
      });

      taskUpdateMock.mockResolvedValue({
        id: "task-1",
        status: "DISPUTED",
      });

      auditCreateMock.mockResolvedValue({ id: "audit-1" });

      const res = await openDispute({
        collegeId: "college-ycce",
        userId: "student-1",
        taskId: "task-1",
        reason: "Delivered file is corrupted and missing section 3",
      });

      expect(res.dispute.id).toBe("dispute-1");
      expect(taskUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "task-1" },
          data: { status: "DISPUTED" },
        }),
      );
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "DISPUTE_OPEN",
            entity: "Dispute",
            entityId: "dispute-1",
          }),
        }),
      );
    });

    it("allows the assigned earner to open a dispute if student becomes unresponsive", async () => {
      taskFindFirstMock.mockResolvedValue({
        id: "task-2",
        collegeId: "college-ycce",
        studentId: "student-1",
        earnerId: "earner-1",
        title: "Physics Notes Typing",
        status: "DELIVERED",
        dispute: null,
        escrowHold: { id: "escrow-2", amountPaise: 32000, status: "HELD" },
      });

      disputeCreateMock.mockResolvedValue({
        id: "dispute-2",
        status: "OPEN",
      });
      taskUpdateMock.mockResolvedValue({ id: "task-2", status: "DISPUTED" });
      auditCreateMock.mockResolvedValue({ id: "audit-2" });

      const res = await openDispute({
        collegeId: "college-ycce",
        userId: "earner-1",
        taskId: "task-2",
        reason: "Delivered work 7 days ago, student is not accepting or communicating",
      });

      expect(res.dispute.id).toBe("dispute-2");
      expect(taskUpdateMock).toHaveBeenCalledWith({
        where: { id: "task-2" },
        data: { status: "DISPUTED" },
      });
    });

    it("rejects dispute opening by an unauthorized 3rd-party user", async () => {
      taskFindFirstMock.mockResolvedValue({
        id: "task-1",
        collegeId: "college-ycce",
        studentId: "student-1",
        earnerId: "earner-1",
        status: "ASSIGNED",
        dispute: null,
      });

      await expect(
        openDispute({
          collegeId: "college-ycce",
          userId: "intruder-student-99",
          taskId: "task-1",
          reason: "Not my task",
        }),
      ).rejects.toThrow("Only the student or assigned earner can open a dispute");
    });

    it("rejects dispute opening if task is already ACCEPTED or OPEN", async () => {
      taskFindFirstMock.mockResolvedValue({
        id: "task-1",
        collegeId: "college-ycce",
        studentId: "student-1",
        earnerId: "earner-1",
        status: "ACCEPTED",
        dispute: null,
      });

      await expect(
        openDispute({
          collegeId: "college-ycce",
          userId: "student-1",
          taskId: "task-1",
          reason: "Complaint after completion",
        }),
      ).rejects.toThrow("Disputes can only be opened for tasks in ASSIGNED or DELIVERED status");
    });

    it("prevents filing a duplicate dispute if one already exists", async () => {
      taskFindFirstMock.mockResolvedValue({
        id: "task-1",
        collegeId: "college-ycce",
        studentId: "student-1",
        earnerId: "earner-1",
        status: "ASSIGNED",
        dispute: { id: "existing-dispute" },
      });

      await expect(
        openDispute({
          collegeId: "college-ycce",
          userId: "student-1",
          taskId: "task-1",
          reason: "Filing another dispute",
        }),
      ).rejects.toThrow("A dispute has already been filed for this task");
    });
  });

  describe("Dispute Resolution & Double-Entry Ledger Settlements", () => {
    it("rejects cross-college dispute resolution by a College Admin", async () => {
      disputeFindUniqueMock.mockResolvedValue({
        id: "dispute-1",
        collegeId: "college-rcoem",
        status: "OPEN",
        task: { escrowHold: { status: "HELD", amountPaise: 52000 } },
      });

      await expect(
        resolveDispute({
          collegeId: "college-ycce",
          adminId: "admin-ycce",
          isSuperAdmin: false,
          disputeId: "dispute-1",
          decision: "REFUND_STUDENT",
          decisionNotes: "Unauthorized cross-college resolution attempt",
        }),
      ).rejects.toThrow("Cannot resolve disputes from another college");
    });

    it("resolves dispute with 100% REFUND_STUDENT: balanced ledger, escrow refunded, student wallet credited", async () => {
      disputeFindUniqueMock.mockResolvedValue({
        id: "dispute-1",
        collegeId: "college-ycce",
        status: "OPEN",
        task: {
          id: "task-1",
          studentId: "student-1",
          earnerId: "earner-1",
          escrowHold: {
            id: "escrow-1",
            status: "HELD",
            amountPaise: 52000, // Rs. 520
          },
        },
      });

      ledgerCreateManyMock.mockResolvedValue({ count: 2 });
      walletUpsertMock.mockResolvedValue({});
      escrowUpdateMock.mockResolvedValue({ id: "escrow-1", status: "REFUNDED" });
      taskUpdateMock.mockResolvedValue({ id: "task-1", status: "REFUNDED" });
      disputeUpdateMock.mockResolvedValue({
        id: "dispute-1",
        status: "RESOLVED_REFUND",
        decision: "Earner failed to submit deliverable on time. Full refund granted.",
      });
      auditCreateMock.mockResolvedValue({ id: "audit-res-1" });

      const res = await resolveDispute({
        collegeId: "college-ycce",
        adminId: "admin-1",
        disputeId: "dispute-1",
        decision: "REFUND_STUDENT",
        decisionNotes: "Earner failed to submit deliverable on time. Full refund granted.",
      });

      expect(res.dispute.status).toBe("RESOLVED_REFUND");
      expect(res.task.status).toBe("REFUNDED");

      // Verify balanced double-entry ledger movement:
      // Leg 1: Debit ESCROW_HELD (52000)
      // Leg 2: Credit USER_BALANCE for Student (52000)
      const recordedLegs = ledgerCreateManyMock.mock.calls[0][0].data;
      expect(recordedLegs).toHaveLength(2);

      const debitLeg = recordedLegs.find((l: TestLedgerLeg) => l.account === "ESCROW_HELD");
      const creditLeg = recordedLegs.find((l: TestLedgerLeg) => l.account === "USER_BALANCE");

      expect(debitLeg?.debitPaise).toBe(52000);
      expect(debitLeg?.creditPaise).toBe(0);

      expect(creditLeg?.creditPaise).toBe(52000);
      expect(creditLeg?.debitPaise).toBe(0);
      expect(creditLeg?.userId).toBe("student-1");

      // EXACT BALANCE CHECK
      const sumDebits = recordedLegs.reduce((sum: number, l: TestLedgerLeg) => sum + l.debitPaise, 0);
      const sumCredits = recordedLegs.reduce((sum: number, l: TestLedgerLeg) => sum + l.creditPaise, 0);
      expect(sumDebits).toBe(sumCredits);

      // Verify student's wallet is credited
      expect(walletUpsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "student-1" },
          update: { availablePaise: { increment: 52000 } },
        }),
      );

      // Verify EscrowHold updated to REFUNDED
      expect(escrowUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "escrow-1" },
          data: expect.objectContaining({ status: "REFUNDED", releasedById: "admin-1" }),
        }),
      );
    });

    it("resolves dispute with RELEASE_EARNER: balanced 3-leg distribution, commission deducted, earner paid", async () => {
      disputeFindUniqueMock.mockResolvedValue({
        id: "dispute-2",
        collegeId: "college-ycce",
        status: "OPEN",
        task: {
          id: "task-2",
          studentId: "student-1",
          earnerId: "earner-1",
          escrowHold: {
            id: "escrow-2",
            status: "HELD",
            amountPaise: 52000, // Rs. 520 (Rs. 500 task + Rs. 20 payer fee)
          },
        },
      });

      ledgerCreateManyMock.mockResolvedValue({ count: 3 });
      walletUpsertMock.mockResolvedValue({});
      escrowUpdateMock.mockResolvedValue({ id: "escrow-2", status: "RELEASED" });
      taskUpdateMock.mockResolvedValue({ id: "task-2", status: "ACCEPTED" });
      disputeUpdateMock.mockResolvedValue({
        id: "dispute-2",
        status: "RESOLVED_RELEASE",
        decision: "Deliverable inspected and found fully compliant with assignment instructions.",
      });
      auditCreateMock.mockResolvedValue({ id: "audit-res-2" });

      const res = await resolveDispute({
        collegeId: "college-ycce",
        adminId: "admin-1",
        disputeId: "dispute-2",
        decision: "RELEASE_EARNER",
        decisionNotes:
          "Deliverable inspected and found fully compliant with assignment instructions.",
      });

      expect(res.dispute.status).toBe("RESOLVED_RELEASE");
      expect(res.task.status).toBe("ACCEPTED");

      // Verify balanced 3-leg distribution:
      // Agreed: Rs. 500 (50,000 paise).
      // Commission 10%: Rs. 50 (5,000 paise).
      // Earner Net: Rs. 450 (45,000 paise).
      // Platform Revenue: Rs. 50 commission + Rs. 20 fee = Rs. 70 (7,000 paise).
      // Escrow held debit: Rs. 520 (52,000 paise).
      const recordedLegs = ledgerCreateManyMock.mock.calls[0][0].data;
      expect(recordedLegs).toHaveLength(3);

      const escrowLeg = recordedLegs.find((l: TestLedgerLeg) => l.account === "ESCROW_HELD");
      const earnerLeg = recordedLegs.find((l: TestLedgerLeg) => l.account === "USER_BALANCE");
      const revenueLeg = recordedLegs.find((l: TestLedgerLeg) => l.account === "PLATFORM_REVENUE");

      expect(escrowLeg?.debitPaise).toBe(52000);
      expect(earnerLeg?.creditPaise).toBe(45000);
      expect(revenueLeg?.creditPaise).toBe(7000);

      // Invariant: sum of debits == sum of credits
      const sumDebits = recordedLegs.reduce((sum: number, l: TestLedgerLeg) => sum + l.debitPaise, 0);
      const sumCredits = recordedLegs.reduce((sum: number, l: TestLedgerLeg) => sum + l.creditPaise, 0);
      expect(sumDebits).toBe(52000);
      expect(sumCredits).toBe(52000);

      // Verify earner wallet credited
      expect(walletUpsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "earner-1" },
          update: {
            availablePaise: { increment: 45000 },
            totalEarnedPaise: { increment: 45000 },
          },
        }),
      );
    });

    it("resolves dispute with SPLIT settlement ensuring exact ledger balance", async () => {
      disputeFindUniqueMock.mockResolvedValue({
        id: "dispute-3",
        collegeId: "college-ycce",
        status: "OPEN",
        task: {
          id: "task-3",
          studentId: "student-1",
          earnerId: "earner-1",
          escrowHold: {
            id: "escrow-3",
            status: "HELD",
            amountPaise: 52000,
          },
        },
      });

      ledgerCreateManyMock.mockResolvedValue({});
      walletUpsertMock.mockResolvedValue({});
      escrowUpdateMock.mockResolvedValue({});
      taskUpdateMock.mockResolvedValue({ id: "task-3", status: "ACCEPTED" });
      disputeUpdateMock.mockResolvedValue({ id: "dispute-3", status: "CLOSED" });
      auditCreateMock.mockResolvedValue({});

      // Split: Rs. 250 (25,000 paise) to student, Rs. 200 (20,000 paise) to earner, Rs. 70 (7,000 paise) to platform
      const res = await resolveDispute({
        collegeId: "college-ycce",
        adminId: "admin-1",
        disputeId: "dispute-3",
        decision: "SPLIT",
        decisionNotes: "Partial work accepted with minor defects. 50-40-10 split.",
        splitStudentPaise: 25000,
        splitEarnerPaise: 20000,
      });

      expect(res.dispute.status).toBe("CLOSED");

      const recordedLegs = ledgerCreateManyMock.mock.calls[0][0].data;
      const sumDebits = recordedLegs.reduce((sum: number, l: TestLedgerLeg) => sum + l.debitPaise, 0);
      const sumCredits = recordedLegs.reduce((sum: number, l: TestLedgerLeg) => sum + l.creditPaise, 0);
      expect(sumDebits).toBe(52000);
      expect(sumCredits).toBe(52000);
    });

    it("rejects SPLIT settlement if split amounts exceed held escrow", async () => {
      disputeFindUniqueMock.mockResolvedValue({
        id: "dispute-3",
        collegeId: "college-ycce",
        status: "OPEN",
        task: {
          id: "task-3",
          studentId: "student-1",
          earnerId: "earner-1",
          escrowHold: {
            id: "escrow-3",
            status: "HELD",
            amountPaise: 52000,
          },
        },
      });

      await expect(
        resolveDispute({
          collegeId: "college-ycce",
          adminId: "admin-1",
          disputeId: "dispute-3",
          decision: "SPLIT",
          decisionNotes: "Invalid excessive split",
          splitStudentPaise: 30000,
          splitEarnerPaise: 30000, // 300 + 300 = 600 > 520
        }),
      ).rejects.toThrow("cannot exceed total held escrow");
    });
  });

  describe("Safety & Three-Strike Escalation System", () => {
    it("issues Strike 1 as an official warning without suspension", async () => {
      userFindUniqueMock.mockResolvedValue({
        id: "user-bad",
        name: "Rohan Student",
        status: "ACTIVE",
        collegeId: "college-ycce",
      });

      auditCountMock.mockResolvedValue(0); // 0 prior strikes
      auditCreateMock.mockResolvedValue({ id: "strike-log-1" });

      const res = await issueUserStrike({
        collegeId: "college-ycce",
        adminId: "admin-1",
        targetUserId: "user-bad",
        reason: "Circumventing platform payments via WhatsApp",
      });

      expect(res.strikeCount).toBe(1);
      expect(res.suspended).toBe(false);
      expect(userUpdateMock).not.toHaveBeenCalled();
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "USER_STRIKE",
            metadata: expect.objectContaining({
              strikeNumber: 1,
              automaticSuspension: false,
            }),
          }),
        }),
      );
    });

    it("issues Strike 2 as a second warning without suspension", async () => {
      userFindUniqueMock.mockResolvedValue({
        id: "user-bad",
        name: "Rohan Student",
        status: "ACTIVE",
        collegeId: "college-ycce",
      });

      auditCountMock.mockResolvedValue(1); // 1 prior strike
      auditCreateMock.mockResolvedValue({ id: "strike-log-2" });

      const res = await issueUserStrike({
        collegeId: "college-ycce",
        adminId: "admin-1",
        targetUserId: "user-bad",
        reason: "Unresponsive after taking task assignment",
      });

      expect(res.strikeCount).toBe(2);
      expect(res.suspended).toBe(false);
      expect(userUpdateMock).not.toHaveBeenCalled();
    });

    it("issues Strike 3 and triggers AUTOMATIC SUSPENSION and wallet freeze", async () => {
      userFindUniqueMock.mockResolvedValue({
        id: "user-bad",
        name: "Rohan Student",
        status: "ACTIVE",
        collegeId: "college-ycce",
      });

      auditCountMock.mockResolvedValue(2); // 2 prior strikes -> 3rd strike!
      userUpdateMock.mockResolvedValue({ id: "user-bad", status: "SUSPENDED" });
      walletUpdateManyMock.mockResolvedValue({ count: 1 });
      auditCreateMock.mockResolvedValue({ id: "strike-log-3" });

      const res = await issueUserStrike({
        collegeId: "college-ycce",
        adminId: "admin-1",
        targetUserId: "user-bad",
        reason: "Submitted AI plagiarism and repeatedly violated guidelines",
      });

      expect(res.strikeCount).toBe(3);
      expect(res.suspended).toBe(true);

      // Verify User is SUSPENDED
      expect(userUpdateMock).toHaveBeenCalledWith({
        where: { id: "user-bad" },
        data: { status: "SUSPENDED" },
      });

      // Verify User's wallet is FROZEN
      expect(walletUpdateManyMock).toHaveBeenCalledWith({
        where: { userId: "user-bad" },
        data: { status: "FROZEN" },
      });

      // Verify AuditLog action is USER_STRIKE_SUSPEND
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "USER_STRIKE_SUSPEND",
            metadata: expect.objectContaining({
              strikeNumber: 3,
              automaticSuspension: true,
            }),
          }),
        }),
      );
    });

    it("allows admin to reinstate a suspended user and unfreeze wallet", async () => {
      userFindUniqueMock.mockResolvedValue({
        id: "user-bad",
        status: "SUSPENDED",
        collegeId: "college-ycce",
      });

      userUpdateMock.mockResolvedValue({ id: "user-bad", status: "ACTIVE" });
      walletUpdateManyMock.mockResolvedValue({ count: 1 });
      auditCreateMock.mockResolvedValue({ id: "audit-reinstate" });

      const res = await reinstateUser({
        collegeId: "college-ycce",
        adminId: "admin-1",
        targetUserId: "user-bad",
        reason: "Appeal accepted following meeting with Dean",
      });

      expect(res.success).toBe(true);
      expect(userUpdateMock).toHaveBeenCalledWith({
        where: { id: "user-bad" },
        data: { status: "ACTIVE" },
      });
      expect(walletUpdateManyMock).toHaveBeenCalledWith({
        where: { userId: "user-bad" },
        data: { status: "ACTIVE" },
      });
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "USER_REINSTATE",
          }),
        }),
      );
    });
  });

  describe("Academic Integrity & Category Whitelist Guardrails", () => {
    it("flags academic integrity violations for exam cheating phrases", () => {
      const check1 = verifyAcademicIntegrity("Need someone for online test cheat tomorrow");
      expect(check1.isValid).toBe(false);
      expect(check1.violationMessage).toContain("Academic Integrity policy");

      const check2 = verifyAcademicIntegrity("Proxy attendance for 3 lectures");
      expect(check2.isValid).toBe(false);

      const check3 = verifyAcademicIntegrity("Please write my exam for me");
      expect(check3.isValid).toBe(false);

      const check4 = verifyAcademicIntegrity("Paper leak for mid-term physics");
      expect(check4.isValid).toBe(false);
    });

    it("passes academic assistance tasks adhering to the category whitelist", () => {
      const check1 = verifyAcademicIntegrity(
        "Format my practical file in IEEE LaTeX template with clean margin formatting",
      );
      expect(check1.isValid).toBe(true);

      const check2 = verifyAcademicIntegrity(
        "Draw block diagrams and circuit schematics for 8085 microprocessor",
      );
      expect(check2.isValid).toBe(true);

      const check3 = verifyAcademicIntegrity(
        "1-on-1 tutoring session on dynamic programming and graph algorithms",
      );
      expect(check3.isValid).toBe(true);
    });
  });
});
