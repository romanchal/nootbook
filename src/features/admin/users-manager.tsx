"use client";

import { useState, useTransition } from "react";
import { assignRoleAction, revokeRoleAction, updateUserStatusAction } from "./actions";
import { issueStrikeAction } from "@/features/disputes/actions";
import { Button } from "@/components/ui/button";

interface UserItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "BANNED";
  createdAt: Date;
  college: {
    id: string;
    name: string;
    slug: string;
  } | null;
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
  roles: Array<{
    id: string;
    name: string;
    department: { name: string; code: string } | null;
    class: { semester: number } | null;
  }>;
  _count: {
    uploadedResources: number;
    bookmarks: number;
  };
}

export function UsersManager({
  users,
  isSuperAdmin = false,
}: {
  users: UserItem[];
  isSuperAdmin?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"ROLE" | "STATUS" | "STRIKE" | null>(null);
  const [isPending, startTransition] = useTransition();

  // Role form state
  const [roleName, setRoleName] = useState("CLASS_ADMIN");
  // Status form state
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "SUSPENDED">("SUSPENDED");
  const [statusReason, setStatusReason] = useState("");
  // Strike form state
  const [strikeReason, setStrikeReason] = useState("");

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  });

  function handleAssignRole(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUserId) return;

    const formData = new FormData();
    formData.set("targetUserId", selectedUserId);
    formData.set("roleName", roleName);

    startTransition(async () => {
      const res = await assignRoleAction(formData);
      if (res.error) {
        alert(res.error);
      } else {
        setSelectedUserId(null);
        setActionType(null);
      }
    });
  }

  function handleRevokeRole(roleId: string) {
    if (!confirm("Are you sure you want to revoke this role?")) return;
    const formData = new FormData();
    formData.set("roleId", roleId);

    startTransition(async () => {
      const res = await revokeRoleAction(formData);
      if (res.error) {
        alert(res.error);
      }
    });
  }

  function handleStatusUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUserId || !statusReason.trim()) return;

    const formData = new FormData();
    formData.set("targetUserId", selectedUserId);
    formData.set("status", newStatus);
    formData.set("reason", statusReason.trim());

    startTransition(async () => {
      const res = await updateUserStatusAction(formData);
      if (res.error) {
        alert(res.error);
      } else {
        setSelectedUserId(null);
        setActionType(null);
        setStatusReason("");
      }
    });
  }

  function handleIssueStrike(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUserId || !strikeReason.trim()) return;

    const formData = new FormData();
    formData.set("targetUserId", selectedUserId);
    formData.set("reason", strikeReason.trim());

    startTransition(async () => {
      const res = await issueStrikeAction(formData);
      if (res.error) {
        alert(res.error);
      } else {
        alert(
          `Strike recorded! Total strikes: ${res.strikeCount}.${
            res.suspended ? " User has been automatically suspended." : ""
          }`,
        );
        setSelectedUserId(null);
        setActionType(null);
        setStrikeReason("");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center gap-2">
        <input
          type="search"
          placeholder="Filter users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full max-w-sm rounded-lg border bg-background px-3 text-xs focus:border-primary focus:outline-hidden"
        />
        <span className="text-xs text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </span>
      </div>

      {/* Users List */}
      <div className="rounded-xl border bg-card divide-y overflow-hidden shadow-2xs">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No users matched your query.
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isEditing = selectedUserId === u.id;

            return (
              <div key={u.id} className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{u.name}</h4>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : u.status === "SUSPENDED"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {u.email ?? u.phone} {u.college ? `· ${u.college.name}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUserId(isEditing && actionType === "ROLE" ? null : u.id);
                        setActionType("ROLE");
                      }}
                    >
                      + Assign Role
                    </Button>
                    <Button
                      size="sm"
                      variant={u.status === "SUSPENDED" ? "default" : "secondary"}
                      onClick={() => {
                        setSelectedUserId(isEditing && actionType === "STATUS" ? null : u.id);
                        setActionType("STATUS");
                        setNewStatus(u.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED");
                      }}
                    >
                      {u.status === "SUSPENDED" ? "Unsuspend" : "Suspend"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 text-xs"
                      onClick={() => {
                        setSelectedUserId(isEditing && actionType === "STRIKE" ? null : u.id);
                        setActionType("STRIKE");
                      }}
                    >
                      ⚠️ Strike
                    </Button>
                  </div>
                </div>

                {/* Roles Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-muted-foreground">Roles:</span>
                  {u.roles.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground italic">
                      Student (default)
                    </span>
                  ) : (
                    u.roles.map((r) => (
                      <span
                        key={r.id}
                        className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                      >
                        {r.name.replace("_", " ")}
                        <button
                          type="button"
                          onClick={() => handleRevokeRole(r.id)}
                          className="hover:text-destructive font-bold ml-0.5 text-xs"
                          title="Revoke role"
                          disabled={isPending}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Sub-form: Assign Role */}
                {isEditing && actionType === "ROLE" && (
                  <form
                    onSubmit={handleAssignRole}
                    className="rounded-lg border bg-muted/40 p-3 space-y-2 text-xs"
                  >
                    <span className="font-semibold text-foreground">
                      Assign New Role to {u.name}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        className="h-8 rounded border bg-background px-2 text-xs text-foreground"
                      >
                        <option value="CLASS_ADMIN">Class Admin</option>
                        <option value="EARNER">Verified Earner</option>
                        {isSuperAdmin && (
                          <>
                            <option value="COLLEGE_ADMIN">College Admin</option>
                            <option value="DEPARTMENT_ADMIN">Department Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                          </>
                        )}
                      </select>
                      <Button type="submit" size="sm" disabled={isPending}>
                        Confirm Assignment
                      </Button>
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(null)}
                        className="text-xs text-muted-foreground hover:underline ml-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Sub-form: Status change */}
                {isEditing && actionType === "STATUS" && (
                  <form
                    onSubmit={handleStatusUpdate}
                    className="rounded-lg border bg-muted/40 p-3 space-y-2 text-xs"
                  >
                    <span className="font-semibold text-foreground">
                      {newStatus === "SUSPENDED" ? "Suspend Account" : "Reactivate Account"} for{" "}
                      {u.name}
                    </span>
                    <input
                      type="text"
                      placeholder="Reason for status change (required)..."
                      required
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      className="h-8 w-full rounded border bg-background px-2.5 text-xs text-foreground"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        variant={newStatus === "SUSPENDED" ? "destructive" : "default"}
                        disabled={isPending}
                      >
                        Confirm {newStatus}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(null)}
                        className="text-xs text-muted-foreground hover:underline ml-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Sub-form: Issue Strike */}
                {isEditing && actionType === "STRIKE" && (
                  <form
                    onSubmit={handleIssueStrike}
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-950 dark:text-amber-200">
                        Issue Conduct & Safety Strike to {u.name}
                      </span>
                      <span className="text-[10px] text-amber-800 dark:text-amber-300">
                        3 strikes = Automatic Suspension
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Reason for strike (e.g. academic integrity violation, bad faith dispute)..."
                      required
                      value={strikeReason}
                      onChange={(e) => setStrikeReason(e.target.value)}
                      className="h-8 w-full rounded border bg-background px-2.5 text-xs text-foreground"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        disabled={isPending || !strikeReason.trim()}
                      >
                        Confirm Issue Strike
                      </Button>
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(null)}
                        className="text-xs text-muted-foreground hover:underline ml-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
