import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock next/navigation
const redirectMock = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    redirectMock(url);
    throw new Error(`REDIRECT:${url}`);
  },
}));

// Mock current-user and db
type MockUserData = {
  id: string;
  email: string;
  collegeId: string | null;
  roles: Array<{
    id: string;
    name: "STUDENT" | "EARNER" | "CLASS_ADMIN" | "DEPARTMENT_ADMIN" | "COLLEGE_ADMIN" | "SUPER_ADMIN";
    collegeId: string | null;
    classId?: string | null;
    departmentId?: string | null;
  }>;
};

let mockUser: MockUserData | null = null;
vi.mock("@/features/auth/current-user", () => ({
  getAuthUser: vi.fn(async () => (mockUser ? { id: mockUser.id, email: mockUser.email } : null)),
}));

vi.mock("@/features/auth/ensure-user", () => ({
  provisionOnFirstSignIn: vi.fn(async () => mockUser),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(async () => mockUser),
    },
  },
}));

import {
  requireAppUser,
  requireClassAdminGuard,
  requireCollegeAdminGuard,
  requireEarnerGuard,
  requireSuperAdminGuard,
} from "./guards";

describe("Route guards", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    mockUser = null;
  });

  it("redirects unauthenticated users to /login", async () => {
    mockUser = null;
    await expect(requireAppUser()).rejects.toThrow("REDIRECT:/login");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("allows authenticated student into general dashboard", async () => {
    mockUser = {
      id: "user-1",
      email: "student@college.edu",
      collegeId: "pilot-college",
      roles: [{ id: "r1", name: "STUDENT", collegeId: "pilot-college" }],
    };

    const user = await requireAppUser();
    expect(user.id).toBe("user-1");
  });

  it("blocks regular student from earner panel", async () => {
    mockUser = {
      id: "user-1",
      email: "student@college.edu",
      collegeId: "pilot-college",
      roles: [{ id: "r1", name: "STUDENT", collegeId: "pilot-college" }],
    };

    await expect(requireEarnerGuard()).rejects.toThrow("REDIRECT:/unauthorized?required=EARNER");
    expect(redirectMock).toHaveBeenCalledWith("/unauthorized?required=EARNER");
  });

  it("allows verified earner into earner panel", async () => {
    mockUser = {
      id: "user-earner",
      email: "earner@college.edu",
      collegeId: "pilot-college",
      roles: [
        { id: "r1", name: "STUDENT", collegeId: "pilot-college" },
        { id: "r2", name: "EARNER", collegeId: "pilot-college" },
      ],
    };

    const user = await requireEarnerGuard();
    expect(user.id).toBe("user-earner");
  });

  it("blocks non-admin from class admin console", async () => {
    mockUser = {
      id: "user-1",
      email: "student@college.edu",
      collegeId: "pilot-college",
      roles: [{ id: "r1", name: "STUDENT", collegeId: "pilot-college" }],
    };

    await expect(requireClassAdminGuard()).rejects.toThrow(
      "REDIRECT:/unauthorized?required=CLASS_ADMIN",
    );
  });

  it("allows class admin into class admin console", async () => {
    mockUser = {
      id: "user-class-admin",
      email: "classadmin@college.edu",
      collegeId: "pilot-college",
      roles: [{ id: "r3", name: "CLASS_ADMIN", collegeId: "pilot-college", classId: "class-1" }],
    };

    const user = await requireClassAdminGuard("class-1");
    expect(user.id).toBe("user-class-admin");
  });

  it("blocks non-college-admin from college admin console", async () => {
    mockUser = {
      id: "user-1",
      email: "student@college.edu",
      collegeId: "pilot-college",
      roles: [{ id: "r1", name: "STUDENT", collegeId: "pilot-college" }],
    };

    await expect(requireCollegeAdminGuard()).rejects.toThrow(
      "REDIRECT:/unauthorized?required=COLLEGE_ADMIN",
    );
  });

  it("allows college admin into college admin console", async () => {
    mockUser = {
      id: "user-college-admin",
      email: "admin@college.edu",
      collegeId: "pilot-college",
      roles: [{ id: "r4", name: "COLLEGE_ADMIN", collegeId: "pilot-college" }],
    };

    const user = await requireCollegeAdminGuard();
    expect(user.id).toBe("user-college-admin");
  });

  it("blocks non-super-admin from super console", async () => {
    mockUser = {
      id: "user-college-admin",
      email: "admin@college.edu",
      collegeId: "pilot-college",
      roles: [{ id: "r4", name: "COLLEGE_ADMIN", collegeId: "pilot-college" }],
    };

    await expect(requireSuperAdminGuard()).rejects.toThrow(
      "REDIRECT:/unauthorized?required=SUPER_ADMIN",
    );
  });

  it("allows super admin access across all screens", async () => {
    mockUser = {
      id: "user-super",
      email: "super@nootbook.in",
      collegeId: null,
      roles: [{ id: "r5", name: "SUPER_ADMIN", collegeId: null }],
    };

    const userSuper = await requireSuperAdminGuard();
    expect(userSuper.id).toBe("user-super");

    const earnerAccess = await requireEarnerGuard();
    expect(earnerAccess.id).toBe("user-super");
  });
});
