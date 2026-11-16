import { describe, expect, it } from "vitest";
import {
  isAllowedFileType,
  rejectResourceSchema,
  uploadResourceSchema,
} from "./schemas";

describe("Upload validation schemas", () => {
  it("validates a proper resource upload payload", () => {
    const valid = {
      title: "Winter 2024 Question Paper",
      subjectId: "sub-123",
      type: "OLD_PAPER",
      academicYear: "2024-25",
      examType: "End-Sem",
      tags: "question paper, 2024",
    };
    const result = uploadResourceSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid academic year formats", () => {
    const invalidYear = {
      title: "Notes on Algorithms",
      subjectId: "sub-123",
      type: "NOTES",
      academicYear: "2024", // Needs YYYY-YY
    };
    const result = uploadResourceSchema.safeParse(invalidYear);
    expect(result.success).toBe(false);
  });

  it("rejects overly short titles", () => {
    const shortTitle = {
      title: "ab",
      subjectId: "sub-123",
      type: "NOTES",
    };
    const result = uploadResourceSchema.safeParse(shortTitle);
    expect(result.success).toBe(false);
  });

  it("checks allowed file extensions and MIME types", () => {
    expect(isAllowedFileType("paper.pdf", "application/pdf")).toBe(true);
    expect(
      isAllowedFileType(
        "assignment.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    ).toBe(true);
    expect(isAllowedFileType("notes.png", "image/png")).toBe(true);

    // Reject executable or dangerous files
    expect(isAllowedFileType("virus.exe", "application/x-msdownload")).toBe(false);
    expect(isAllowedFileType("script.js", "application/javascript")).toBe(false);
    expect(isAllowedFileType("paper.pdf", "application/x-sh")).toBe(false);
  });

  it("validates rejection reasons", () => {
    expect(
      rejectResourceSchema.safeParse({
        resourceId: "res-1",
        reason: "Illegible scan, please re-upload with clear pages.",
      }).success,
    ).toBe(true);

    expect(
      rejectResourceSchema.safeParse({
        resourceId: "res-1",
        reason: "bad", // Too short (< 5 chars)
      }).success,
    ).toBe(false);
  });
});
