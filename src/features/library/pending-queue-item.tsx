"use client";

import { useState } from "react";
import { approveUploadAction, rejectUploadAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFileSize, RESOURCE_TYPE_META } from "./format";
import type { ResourceType } from "@/generated/prisma/client";

interface PendingResourceItemProps {
  resource: {
    id: string;
    title: string;
    description: string | null;
    fileName: string;
    fileSize: number;
    type: ResourceType;
    academicYear: string | null;
    examType: string | null;
    createdAt: Date;
    uploader: {
      name: string;
      email: string | null;
    };
    subject: {
      name: string;
      code: string | null;
    };
    department: {
      name: string;
      code: string;
    };
    class: {
      semester: number;
    };
  };
}

export function PendingQueueItem({ resource }: PendingResourceItemProps) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meta = RESOURCE_TYPE_META[resource.type];

  async function handleApprove() {
    setLoading(true);
    setError(null);
    const res = await approveUploadAction(resource.id);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
    }
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (rejectReason.trim().length < 5) {
      setError("Please provide at least 5 characters for the rejection reason.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("resourceId", resource.id);
    formData.append("reason", rejectReason);

    const res = await rejectUploadAction(formData);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setRejecting(false);
    }
  }

  return (
    <article className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
          >
            {meta.label}
          </span>
          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {resource.department.code} · Sem {resource.class.semester}
          </span>
          {resource.academicYear && (
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {resource.academicYear}
            </span>
          )}
        </div>

        <span className="font-mono text-xs text-muted-foreground">
          {formatFileSize(resource.fileSize)}
        </span>
      </div>

      <div>
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {resource.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Subject: <span className="font-medium text-foreground">{resource.subject.name}</span>
          {resource.subject.code ? ` (${resource.subject.code})` : ""}
        </p>
        {resource.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
            {resource.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
        <div>
          Uploaded by <span className="font-medium text-foreground">{resource.uploader.name}</span>
          {resource.uploader.email ? ` (${resource.uploader.email})` : ""}
        </div>

        <div className="flex items-center gap-2">
          {!rejecting ? (
            <>
              <Button
                onClick={() => setRejecting(true)}
                disabled={loading}
                variant="outline"
                size="sm"
                className="text-xs text-destructive hover:bg-destructive/10"
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={loading}
                variant="default"
                size="sm"
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {loading ? "Approving…" : "Approve & Publish"}
              </Button>
            </>
          ) : (
            <form onSubmit={handleReject} className="flex flex-wrap items-center gap-2">
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason (e.g. illegible, incorrect semester)..."
                required
                className="h-8 text-xs w-64"
              />
              <Button
                type="submit"
                disabled={loading}
                variant="destructive"
                size="sm"
                className="text-xs"
              >
                {loading ? "Rejecting…" : "Confirm Reject"}
              </Button>
              <Button
                type="button"
                onClick={() => setRejecting(false)}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Cancel
              </Button>
            </form>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive border-t pt-2">{error}</p>
      )}
    </article>
  );
}
