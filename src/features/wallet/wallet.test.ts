import { describe, expect, it, vi } from "vitest";

const ledgerCreateManyMock = vi.fn();
const escrowCreateMock = vi.fn();
const escrowUpdateMock = vi.fn();
const escrowFindUniqueMock = vi.fn();

const taskFindFirstMock = vi.fn();
const taskUpdateMock = vi.fn();

const bidFindFirstMock = vi.fn();
const bidUpdateMock = vi.fn();
const bidUpdateManyMock = vi.fn();

const userFindUniqueMock = vi.fn();
const walletFindUniqueMock = vi.fn();
const walletCreateMock = vi.fn();
const walletUpdateMock = vi.fn();
const walletUpsertMock = vi.fn();

const payoutCreateMock = vi.fn();
const payoutUpdateMock = vi.fn();
const payoutFindFirstMock = vi.fn();

const auditCreateMock = vi.fn();
const configFindFirstMock = vi.fn();

vi.mock("@/lib/db", () => {
  interface MockDb {
    $transaction: (callback: (tx: MockDb) => Promise<unknown>) => Promise<unknown>;
    [key: string]: unknown;
  }
  const mockDb: MockDb = {
    $transaction: async (callback: (tx: MockDb) => Promise<unknown>) => callback(mockDb),
    ledgerEntry: {
      createMany: (...args: unknown[]) => ledgerCreateManyMock(...args),
    },
    escrowHold: {
      create: (...args: unknown[]) => escrowCreateMock(...args),
      update: (...args: unknown[]) => escrowUpdateMock(...args),
      findUnique: (...args: unknown[]) => escrowFindUniqueMock(...args),
    },
    task: {
      findFirst: (...args: unknown[]) => taskFindFirstMock(...args),
      update: (...args: unknown[]) => taskUpdateMock(...args),
    },
    bid: {
      findFirst: (...args: unknown[]) => bidFindFirstMock(...args),
      update: (...args: unknown[]) => bidUpdateMock(...args),
      updateMany: (...args: unknown[]) => bidUpdateManyMock(...args),
    },
    user: {
      findUnique: (...args: unknown[]) => userFindUniqueMock(...args),
    },
    wallet: {
      findUnique: (...args: unknown[]) => walletFindUniqueMock(...args),
      create: (...args: unknown[]) => walletCreateMock(...args),
      update: (...args: unknown[]) => walletUpdateMock(...args),
      upsert: (...args: unknown[]) => walletUpsertMock(...args),
    },
    payout: {
      create: (...args: unknown[]) => payoutCreateMock(...args),
      update: (...args: unknown[]) => payoutUpdateMock(...args),
      findFirst: (...args: unknown[]) => payoutFindFirstMock(...args),
    },
    auditLog: {
      create: (...args: unknown[]) => auditCreateMock(...args),
    },
    commissionConfig: {
      findFirst: (...args: unknown[]) => configFindFirstMock(...args),
    },
  };
  return { db: mockDb };
});

import { recordBalancedMovement } from "./ledger";
import {
  depositEscrowManual,
  releaseEscrowOnAcceptance,
  requestPayout,
  processPayoutManual,
} from "./service";

describe("Double-Entry Ledger & Manual Escrow System (Step 8)", () => {
  const collegeId = "col-pilot";
  const studentId = "student-100";
  const earnerId = "earner-200";
  const taskId = "task-300";
  const bidId = "bid-400";

  describe("Core Double-Entry Ledger Invariants", () => {
    it("successfully records balanced entries when debits equal credits", async () => {
      ledgerCreateManyMock.mockResolvedValueOnce({ count: 2 });

      const res = await recordBalancedMovement(null, collegeId, "REF-1", [
        { account: "USER_BALANCE", debitPaise: 50000 },
        { account: "ESCROW_HELD", creditPaise: 50000 },
      ]);

      expect(res.totalAmountPaise).toBe(50000);
      expect(ledgerCreateManyMock).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ account: "USER_BALANCE", debitPaise: 50000 }),
          expect.objectContaining({ account: "ESCROW_HELD", creditPaise: 50000 }),
        ]),
      });
    });

    it("detects and throws error on unbalanced debits and credits", async () => {
      await expect(
        recordBalancedMovement(null, collegeId, "REF-BAD", [
          { account: "USER_BALANCE", debitPaise: 50000 },
          { account: "ESCROW_HELD", creditPaise: 40000 }, // Discrepancy!
        ]),
      ).rejects.toThrow(/Ledger unbalance detected/);
    });

    it("rejects movements with fewer than 2 legs or negative values", async () => {
      await expect(
        recordBalancedMovement(null, collegeId, "REF-SOLO", [
          { account: "USER_BALANCE", debitPaise: 50000 },
        ]),
      ).rejects.toThrow(/require at least 2 legs/);

      await expect(
        recordBalancedMovement(null, collegeId, "REF-NEG", [
          { account: "USER_BALANCE", debitPaise: -100 },
          { account: "ESCROW_HELD", creditPaise: -100 },
        ]),
      ).rejects.toThrow(/must be non-negative integers/);
    });
  });

  describe("Manual Escrow Deposit Flow", () => {
    it("deposits escrow in manual mode, assigns task, accepts winning bid, and records balanced ledger movement", async () => {
      taskFindFirstMock.mockResolvedValueOnce({
        id: taskId,
        collegeId,
        studentId,
        status: "OPEN",
        title: "Format project report",
      });
      escrowFindUniqueMock.mockResolvedValueOnce(null); // No existing escrow
      bidFindFirstMock.mockResolvedValueOnce({
        id: bidId,
        taskId,
        earnerId,
        amountPaise: 50000, // Rs. 500
        status: "PENDING",
        earner: { id: earnerId, name: "Pranav" },
      });
      configFindFirstMock.mockResolvedValueOnce({
        commissionBps: 1000, // 10%
        fixedFeePaise: 2000, // Rs. 20
      });
      escrowCreateMock.mockResolvedValueOnce({
        id: "escrow-1",
        taskId,
        amountPaise: 52000,
        status: "HELD",
      });
      taskUpdateMock.mockResolvedValueOnce({
        id: taskId,
        status: "ASSIGNED",
        earnerId,
      });
      bidUpdateMock.mockResolvedValueOnce({ id: bidId, status: "ACCEPTED" });
      bidUpdateManyMock.mockResolvedValueOnce({ count: 1 });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-escrow" });

      const res = await depositEscrowManual({
        collegeId,
        studentId,
        taskId,
        bidId,
      });

      expect(res.escrowHold.amountPaise).toBe(52000); // 500 + 20 = 520
      expect(escrowCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskId,
            amountPaise: 52000,
            status: "HELD",
            paymentId: expect.stringMatching(/^MANUAL_PAY_/),
          }),
        }),
      );

      // Verify balanced ledger movement
      expect(ledgerCreateManyMock).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            account: "USER_BALANCE",
            debitPaise: 52000,
            userId: studentId,
          }),
          expect.objectContaining({
            account: "ESCROW_HELD",
            creditPaise: 52000,
            taskId,
          }),
        ]),
      });

      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "ESCROW_DEPOSIT_MANUAL",
            entity: "EscrowHold",
          }),
        }),
      );
    });

    it("prevents duplicate escrow deposits on the same task (idempotency)", async () => {
      taskFindFirstMock.mockResolvedValueOnce({
        id: taskId,
        collegeId,
        studentId,
        status: "OPEN",
      });
      escrowFindUniqueMock.mockResolvedValueOnce({
        id: "existing-escrow",
        status: "HELD",
      }); // Already exists!

      await expect(
        depositEscrowManual({
          collegeId,
          studentId,
          taskId,
          bidId,
        }),
      ).rejects.toThrow(/An escrow hold already exists/);
    });
  });

  describe("Escrow Settlement on Acceptance (Section 5 Spec)", () => {
    it("releases escrow: debits ESCROW_HELD (₹520), credits earner USER_BALANCE (₹450), credits PLATFORM_REVENUE (₹70)", async () => {
      taskFindFirstMock.mockResolvedValueOnce({
        id: taskId,
        collegeId,
        studentId,
        earnerId,
        status: "DELIVERED",
        title: "Format project report",
      });
      escrowFindUniqueMock.mockResolvedValueOnce({
        id: "escrow-1",
        taskId,
        amountPaise: 52000, // Rs. 520 total
        status: "HELD",
      });
      configFindFirstMock.mockResolvedValueOnce({
        commissionBps: 1000, // 10%
        fixedFeePaise: 2000, // Rs. 20
      });
      escrowUpdateMock.mockResolvedValueOnce({ id: "escrow-1", status: "RELEASED" });
      taskUpdateMock.mockResolvedValueOnce({ id: taskId, status: "ACCEPTED" });
      walletUpsertMock.mockResolvedValueOnce({ userId: earnerId, availablePaise: 45000 });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-rel" });

      const res = await releaseEscrowOnAcceptance({
        collegeId,
        studentId,
        taskId,
      });

      expect(res.earnerNetPaise).toBe(45000); // Rs. 450
      expect(res.platformRevenuePaise).toBe(7000); // Rs. 70 (Rs. 50 commission + Rs. 20 fee)

      // Verify exact 3-leg balanced double-entry movement:
      // Debit ESCROW_HELD (52000) = Credit USER_BALANCE (45000) + Credit PLATFORM_REVENUE (7000)
      expect(ledgerCreateManyMock).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ account: "ESCROW_HELD", debitPaise: 52000 }),
          expect.objectContaining({
            account: "USER_BALANCE",
            creditPaise: 45000,
            userId: earnerId,
          }),
          expect.objectContaining({
            account: "PLATFORM_REVENUE",
            creditPaise: 7000,
          }),
        ]),
      });

      // Verify earner wallet updated
      expect(walletUpsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: earnerId },
          update: expect.objectContaining({
            availablePaise: { increment: 45000 },
            totalEarnedPaise: { increment: 45000 },
          }),
        }),
      );
    });

    it("rejects escrow release if task has not been marked as DELIVERED", async () => {
      taskFindFirstMock.mockResolvedValueOnce({
        id: taskId,
        collegeId,
        studentId,
        earnerId,
        status: "ASSIGNED", // Not delivered yet!
      });

      await expect(
        releaseEscrowOnAcceptance({
          collegeId,
          studentId,
          taskId,
        }),
      ).rejects.toThrow(/Task must be in DELIVERED status/);
    });
  });

  describe("Payouts and KYC Verification", () => {
    it("enforces KYC verification before allowing withdrawals", async () => {
      userFindUniqueMock.mockResolvedValueOnce({
        id: earnerId,
        kycVerified: false, // NOT KYC verified!
      });

      await expect(
        requestPayout({
          collegeId,
          userId: earnerId,
          amountPaise: 15000,
        }),
      ).rejects.toThrow(/KYC verification required/);
    });

    it("creates payout and debits available balance when user is KYC-verified", async () => {
      userFindUniqueMock.mockResolvedValueOnce({
        id: earnerId,
        kycVerified: true,
      });
      walletFindUniqueMock.mockResolvedValueOnce({
        userId: earnerId,
        availablePaise: 45000,
      });
      payoutCreateMock.mockResolvedValueOnce({
        id: "po-1",
        amountPaise: 20000,
        status: "REQUESTED",
      });
      walletUpdateMock.mockResolvedValueOnce({ availablePaise: 25000 });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-po" });

      const payout = await requestPayout({
        collegeId,
        userId: earnerId,
        amountPaise: 20000,
        notes: "UPI: earner@okaxis",
      });

      expect(payout.id).toBe("po-1");

      // Verify double-entry movement: Debit USER_BALANCE, Credit PAYOUTS_PENDING
      expect(ledgerCreateManyMock).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ account: "USER_BALANCE", debitPaise: 20000 }),
          expect.objectContaining({ account: "PAYOUTS_PENDING", creditPaise: 20000 }),
        ]),
      });

      expect(walletUpdateMock).toHaveBeenCalledWith({
        where: { userId: earnerId },
        data: { availablePaise: { decrement: 20000 } },
      });
    });

    it("admin manually processes payout: settles from PAYOUTS_PENDING", async () => {
      payoutFindFirstMock.mockResolvedValueOnce({
        id: "po-1",
        collegeId,
        userId: earnerId,
        amountPaise: 20000,
        status: "REQUESTED",
      });
      payoutUpdateMock.mockResolvedValueOnce({
        id: "po-1",
        status: "PAID",
      });
      walletUpdateMock.mockResolvedValueOnce({ totalWithdrawnPaise: 20000 });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-process" });

      const updated = await processPayoutManual({
        collegeId,
        adminId: "admin-1",
        payoutId: "po-1",
        reference: "UTR987654321",
      });

      expect(updated.status).toBe("PAID");

      // Verify double-entry clearing movement
      expect(ledgerCreateManyMock).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ account: "PAYOUTS_PENDING", debitPaise: 20000 }),
          expect.objectContaining({ account: "USER_BALANCE", creditPaise: 20000 }),
        ]),
      });
    });
  });
});
