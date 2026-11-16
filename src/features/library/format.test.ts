import { describe, expect, it } from "vitest";
import { formatFileSize, getSemesterYearName, RESOURCE_TYPE_META } from "./format";

describe("Library formatting helpers", () => {
  it("formats file sizes cleanly", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1024 * 1024 * 1.5)).toBe("1.5 MB");
    expect(formatFileSize(1024 * 1024 * 1024 * 2.2)).toBe("2.2 GB");
  });

  it("maps semesters to academic years", () => {
    expect(getSemesterYearName(1)).toBe("First Year");
    expect(getSemesterYearName(2)).toBe("First Year");
    expect(getSemesterYearName(3)).toBe("Second Year");
    expect(getSemesterYearName(4)).toBe("Second Year");
    expect(getSemesterYearName(5)).toBe("Third Year");
    expect(getSemesterYearName(6)).toBe("Third Year");
    expect(getSemesterYearName(7)).toBe("Final Year");
    expect(getSemesterYearName(8)).toBe("Final Year");
  });

  it("contains metadata for all resource types", () => {
    expect(RESOURCE_TYPE_META.OLD_PAPER.label).toBe("Previous Year Paper");
    expect(RESOURCE_TYPE_META.NOTES.label).toBe("Lecture Notes");
    expect(RESOURCE_TYPE_META.LAB_MANUAL.label).toBe("Lab Manual");
  });
});
