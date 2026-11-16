import { db } from "@/lib/db";

export interface UpdateCommissionConfigInput {
  adminId: string;
  collegeId?: string | null;
  commissionBps: number; // e.g. 1000 = 10%
  fixedFeePaise: number; // e.g. 2000 = Rs. 20
}

/**
 * Retrieves the effective commission configuration for a college or the platform default.
 * Defaults to 1000 bps (10%) and 2000 paise (Rs. 20).
 */
export async function getCommissionConfig(collegeId?: string | null) {
  if (collegeId) {
    const collegeConfig = await db.commissionConfig.findFirst({
      where: { collegeId },
    });
    if (collegeConfig) return collegeConfig;
  }

  // Fallback to platform-wide default (collegeId: null)
  const platformDefault = await db.commissionConfig.findFirst({
    where: { collegeId: null },
  });

  if (platformDefault) return platformDefault;

  // Initial fallback if table is empty
  return {
    id: "default",
    collegeId: null,
    commissionBps: 1000,
    fixedFeePaise: 2000,
    updatedById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Updates or creates the commission configuration (Super Admin only).
 * Writes an immutable record to AuditLog.
 */
export async function updateCommissionConfig(input: UpdateCommissionConfigInput) {
  const { adminId, collegeId, commissionBps, fixedFeePaise } = input;

  if (commissionBps < 0 || commissionBps > 5000) {
    throw new Error("Commission rate must be between 0% (0 bps) and 50% (5000 bps).");
  }

  if (fixedFeePaise < 0 || fixedFeePaise > 50000) {
    throw new Error("Fixed fee must be between Rs. 0 and Rs. 500.");
  }

  return db.$transaction(async (tx) => {
    // Find existing config
    const existing = await tx.commissionConfig.findFirst({
      where: { collegeId: collegeId ?? null },
    });

    let config;
    if (existing) {
      config = await tx.commissionConfig.update({
        where: { id: existing.id },
        data: {
          commissionBps,
          fixedFeePaise,
          updatedById: adminId,
        },
      });
    } else {
      config = await tx.commissionConfig.create({
        data: {
          collegeId: collegeId ?? null,
          commissionBps,
          fixedFeePaise,
          updatedById: adminId,
        },
      });
    }

    // Write to AuditLog
    await tx.auditLog.create({
      data: {
        collegeId: collegeId ?? null,
        actorId: adminId,
        action: "COMMISSION_CONFIG_UPDATE",
        entity: "CommissionConfig",
        entityId: config.id,
        metadata: {
          commissionBps,
          commissionPercentage: `${(commissionBps / 100).toFixed(1)}%`,
          fixedFeePaise,
          fixedFeeRupees: `Rs. ${(fixedFeePaise / 100).toFixed(0)}`,
          scope: collegeId ? `College (${collegeId})` : "Platform Default",
        },
      },
    });

    return config;
  });
}
