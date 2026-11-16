import { z } from "zod";
import { ResourceType } from "@/generated/prisma/client";

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.ms-powerpoint", // .ppt
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".doc",
  ".pptx",
  ".ppt",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
] as const;

export function isAllowedFileType(fileName: string, mimeType: string): boolean {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  const validExtension = ALLOWED_EXTENSIONS.some((allowed) => ext === allowed);
  const validMime = ALLOWED_MIME_TYPES.some((allowed) => mimeType === allowed);
  return validExtension && validMime;
}

export const uploadResourceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(120, "Title cannot exceed 120 characters."),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional()
    .nullable(),
  subjectId: z.string().min(1, "Subject selection is required."),
  type: z.nativeEnum(ResourceType, {
    error: "Please select a valid resource category.",
  }),
  academicYear: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, "Academic year must be in format YYYY-YY (e.g. 2024-25).")
    .optional()
    .or(z.literal("")),
  examType: z
    .string()
    .trim()
    .max(50, "Exam type cannot exceed 50 characters.")
    .optional()
    .or(z.literal("")),
  tags: z
    .string()
    .trim()
    .max(200, "Tags string too long.")
    .optional()
    .or(z.literal("")),
});

export const rejectResourceSchema = z.object({
  resourceId: z.string().min(1, "Resource ID is required."),
  reason: z
    .string()
    .trim()
    .min(5, "Rejection reason must be at least 5 characters.")
    .max(300, "Rejection reason cannot exceed 300 characters."),
});

export type UploadResourceInput = z.infer<typeof uploadResourceSchema>;
