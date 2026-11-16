import { db } from "@/lib/db";

export interface CreateCollegeTenantInput {
  name: string;
  slug: string;
  emailDomain?: string;
  city?: string;
  adminId: string;
}

export interface ToggleCollegeStatusInput {
  collegeId: string;
  active: boolean;
  adminId: string;
}

/**
 * Returns list of colleges with aggregate counts for Super Admin dashboard.
 */
export async function getCollegesList() {
  return db.college.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          departments: true,
          users: true,
          resources: true,
          tasks: true,
        },
      },
    },
  });
}

/**
 * Creates a new college tenant and default departments (Super Admin only).
 * Writes an immutable record to AuditLog.
 */
export async function createCollegeTenant(input: CreateCollegeTenantInput) {
  const { name, slug, emailDomain, city = "Nagpur", adminId } = input;

  const normalizedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const normalizedDomain = emailDomain?.trim().toLowerCase() || null;

  return db.$transaction(async (tx) => {
    // 1. Verify slug uniqueness
    const existingSlug = await tx.college.findUnique({
      where: { slug: normalizedSlug },
    });
    if (existingSlug) {
      throw new Error(`College with slug "${normalizedSlug}" already exists.`);
    }

    // 2. Create College
    const college = await tx.college.create({
      data: {
        name: name.trim(),
        slug: normalizedSlug,
        emailDomain: normalizedDomain,
        city: city.trim(),
        active: true,
      },
    });

    // 3. Seed basic engineering departments for the new campus
    const standardDepts = [
      { name: "Computer Engineering", code: "COMP" },
      { name: "Information Technology", code: "IT" },
      { name: "Mechanical Engineering", code: "MECH" },
      { name: "Civil Engineering", code: "CIVIL" },
      { name: "Electrical Engineering", code: "EE" },
      { name: "Electronics & Telecom", code: "ETC" },
    ];

    await tx.department.createMany({
      data: standardDepts.map((d) => ({
        collegeId: college.id,
        name: d.name,
        code: d.code,
        active: true,
      })),
    });

    // 4. Log action in AuditLog
    await tx.auditLog.create({
      data: {
        collegeId: college.id,
        actorId: adminId,
        action: "COLLEGE_CREATE",
        entity: "College",
        entityId: college.id,
        metadata: {
          name: college.name,
          slug: college.slug,
          emailDomain: college.emailDomain,
          city: college.city,
        },
      },
    });

    return college;
  });
}

/**
 * Toggles a college's active state (Super Admin only).
 * Writes an immutable record to AuditLog.
 */
export async function toggleCollegeStatus(input: ToggleCollegeStatusInput) {
  const { collegeId, active, adminId } = input;

  return db.$transaction(async (tx) => {
    const college = await tx.college.update({
      where: { id: collegeId },
      data: { active },
    });

    await tx.auditLog.create({
      data: {
        collegeId: college.id,
        actorId: adminId,
        action: "COLLEGE_STATUS_UPDATE",
        entity: "College",
        entityId: college.id,
        metadata: {
          active,
          collegeName: college.name,
        },
      },
    });

    return college;
  });
}
