"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser, requireClassAdminGuard } from "@/features/auth/guards";
import { recordResourceDownload } from "@/features/library/queries";
import {
  approveResource,
  createPendingResource,
  rejectResource,
} from "@/features/library/admin-queries";
import { toggleBookmark } from "@/features/library/bookmarks";
import {
  isAllowedFileType,
  MAX_FILE_SIZE_BYTES,
  rejectResourceSchema,
  uploadResourceSchema,
} from "@/features/library/schemas";
import { db } from "@/lib/db";
import { z } from "zod";

const reportSchema = z.object({
  resourceId: z.string().min(1),
  reason: z.string().min(5, "Please provide a reason of at least 5 characters."),
});

export async function downloadResource(resourceId: string) {
  const user = await requireAppUser();
  if (!user.collegeId) {
    throw new Error("No college associated with your account.");
  }

  const result = await recordResourceDownload(user.collegeId, resourceId);
  return { success: true, downloadCount: result.downloadCount };
}

export async function submitResourceReport(formData: FormData) {
  const user = await requireAppUser();
  if (!user.collegeId) {
    return { error: "No college associated with your account." };
  }

  const parsed = reportSchema.safeParse({
    resourceId: formData.get("resourceId"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid report submission." };
  }

  await db.report.create({
    data: {
      collegeId: user.collegeId,
      reportedById: user.id,
      resourceId: parsed.data.resourceId,
      reason: parsed.data.reason,
      status: "OPEN",
    },
  });

  revalidatePath("/library");
  return { success: true };
}

/**
 * Handles student resource upload:
 * - Validates input and file safety constraints
 * - Saves resource with status = PENDING
 * - Tags resource
 */
export async function uploadResource(formData: FormData) {
  const user = await requireAppUser();
  if (!user.collegeId) {
    return { error: "Your account is not linked to an active college." };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Please select a file to upload." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: "File exceeds the 25 MB size limit." };
  }

  if (!isAllowedFileType(file.name, file.type)) {
    return {
      error:
        "Invalid file format. Allowed types: PDF, Word (docx/doc), PowerPoint (pptx/ppt), JPEG, PNG.",
    };
  }

  const parsed = uploadResourceSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    subjectId: formData.get("subjectId"),
    type: formData.get("type"),
    academicYear: formData.get("academicYear") || undefined,
    examType: formData.get("examType") || undefined,
    tags: formData.get("tags") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed." };
  }

  // Look up subject to associate department and class
  const subject = await db.subject.findFirst({
    where: {
      id: parsed.data.subjectId,
      collegeId: user.collegeId,
      active: true,
    },
  });

  if (!subject) {
    return { error: "Selected subject not found in your college curriculum." };
  }

  // Parse comma-separated tags
  const tags = parsed.data.tags
    ? parsed.data.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    : [];

  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileKey = `colleges/${user.collegeId}/resources/${timestamp}-${safeFileName}`;

  const resource = await createPendingResource({
    collegeId: user.collegeId,
    departmentId: subject.departmentId,
    classId: subject.classId,
    subjectId: subject.id,
    uploaderId: user.id,
    type: parsed.data.type,
    title: parsed.data.title,
    description: parsed.data.description,
    fileName: file.name,
    fileKey,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size,
    academicYear: parsed.data.academicYear,
    examType: parsed.data.examType,
    tags,
  });

  revalidatePath("/library");
  revalidatePath("/admin/class");

  return { success: true, resourceId: resource.id };
}

/**
 * Class Admin action: Approve pending upload.
 */
export async function approveUploadAction(resourceId: string) {
  const user = await requireClassAdminGuard();
  if (!user.collegeId) {
    return { error: "No college assigned." };
  }

  await approveResource({
    collegeId: user.collegeId,
    adminId: user.id,
    resourceId,
  });

  revalidatePath("/admin/class");
  revalidatePath("/library");
  return { success: true };
}

/**
 * Class Admin action: Reject pending upload with reason.
 */
export async function rejectUploadAction(formData: FormData) {
  const user = await requireClassAdminGuard();
  if (!user.collegeId) {
    return { error: "No college assigned." };
  }

  const parsed = rejectResourceSchema.safeParse({
    resourceId: formData.get("resourceId"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid rejection input." };
  }

  await rejectResource({
    collegeId: user.collegeId,
    adminId: user.id,
    resourceId: parsed.data.resourceId,
    reason: parsed.data.reason,
  });

  revalidatePath("/admin/class");
  return { success: true };
}

/**
 * Toggles a bookmark on a resource for the authenticated student.
 */
export async function toggleBookmarkAction(resourceId: string) {
  const user = await requireAppUser();
  if (!user.collegeId) {
    return { error: "No college associated with your account." };
  }

  try {
    const result = await toggleBookmark(user.collegeId, user.id, resourceId);
    revalidatePath("/library/bookmarks");
    revalidatePath("/library");
    return { success: true, bookmarked: result.bookmarked };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to toggle bookmark.",
    };
  }
}

