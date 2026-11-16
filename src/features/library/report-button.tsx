"use client";

import { useState } from "react";
import { submitResourceReport } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReportResourceButton({ resourceId }: { resourceId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    const formData = new FormData();
    formData.append("resourceId", resourceId);
    formData.append("reason", reason);

    const res = await submitResourceReport(formData);
    if (res?.error) {
      setStatus("error");
      setErrorMessage(res.error);
    } else {
      setStatus("success");
      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
        setReason("");
      }, 1500);
    }
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground hover:text-destructive"
      >
        Report
      </Button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-left">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-destructive">Report this resource</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      {status === "success" ? (
        <p className="mt-2 text-xs text-emerald-600 font-medium">
          ✓ Report submitted. A Class Admin will review it shortly.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-2 space-y-2">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (e.g., incorrect syllabus, illegible, copyright)..."
            required
            className="text-xs h-8"
          />
          {status === "error" && (
            <p className="text-xs text-destructive">{errorMessage}</p>
          )}
          <Button
            type="submit"
            disabled={status === "submitting"}
            size="sm"
            variant="destructive"
            className="w-full text-xs h-7"
          >
            {status === "submitting" ? "Submitting…" : "Confirm Report"}
          </Button>
        </form>
      )}
    </div>
  );
}
