"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTaskAction } from "./actions";
import { TASK_TYPE_META } from "./format";
import { Button } from "@/components/ui/button";
import type { TaskType } from "@/generated/prisma/client";

interface SubjectOption {
  id: string;
  name: string;
  code: string | null;
  department: { code: string };
  class: { semester: number };
}

export function PostTaskForm({ subjects }: { subjects: SubjectOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<TaskType>("FORMATTING");
  const [budgetRupees, setBudgetRupees] = useState<number>(500);

  // Default deadline 3 days in the future (initialized once)
  const [formattedDefaultDeadline] = useState(() => {
    const defaultDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    return defaultDate.toISOString().slice(0, 16);
  });

  // Commission/platform fee preview (Section 5 model: fixed ₹20 payer fee)
  const platformFee = 20;
  const totalAmount = budgetRupees + platformFee;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("type", selectedType);

    startTransition(async () => {
      const res = await createTaskAction(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.taskId) {
        router.push(`/tasks/${res.taskId}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Academic Integrity Notice (Section 6 & 17.8) */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
          <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Academic Integrity Policy
        </div>
        <p>
          Tasks must provide legitimate academic assistance (formatting, typing rough notes, slide design, diagrams, proofreading, or tutoring).
          <strong> Exam cheating, proxy submissions, and test impersonation are strictly forbidden</strong> and result in immediate account suspension.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
          {error}
        </div>
      )}

      {/* Allowed Whitelist Category Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-foreground">
          Assistance Category <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {(Object.keys(TASK_TYPE_META) as TaskType[]).map((key) => {
            const meta = TASK_TYPE_META[key];
            const isSelected = selectedType === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedType(key)}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                    : "border-border bg-card hover:border-foreground/20 hover:bg-muted/30"
                }`}
              >
                <span className="text-xl">{meta.icon}</span>
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">{meta.label}</div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {meta.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-foreground">
          Task Title <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          name="title"
          required
          minLength={5}
          maxLength={100}
          placeholder="e.g. Format Unit 3 DBMS project report according to college guidelines"
          className="h-10 w-full rounded-lg border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
        />
        <span className="text-[11px] text-muted-foreground">
          Be clear about the deliverable (5-100 characters).
        </span>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-foreground">
          Detailed Instructions & Requirements <span className="text-destructive">*</span>
        </label>
        <textarea
          name="description"
          required
          rows={4}
          minLength={10}
          maxLength={2000}
          placeholder="Specify formatting style, number of pages, rough sketches provided, software tools (Word, LaTeX, Canva, Proteus), or questions to explain..."
          className="w-full rounded-lg border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Subject */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Related Subject (optional)
          </label>
          <select
            name="subjectId"
            className="h-10 w-full rounded-lg border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="">General / None</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.department.code} S{s.class.semester}] {s.name} {s.code ? `(${s.code})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Deadline */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Submission Deadline <span className="text-destructive">*</span>
          </label>
          <input
            type="datetime-local"
            name="deadline"
            required
            defaultValue={formattedDefaultDeadline}
            className="h-10 w-full rounded-lg border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
          />
        </div>
      </div>

      {/* Budget & Live Breakdown */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground">
            Your Proposed Budget: <span className="text-primary font-bold">₹{budgetRupees}</span>
          </label>
          <span className="text-[11px] text-muted-foreground">Min ₹50 · Max ₹10,000</span>
        </div>

        <input
          type="range"
          name="budgetRupees"
          min="50"
          max="3000"
          step="50"
          value={budgetRupees}
          onChange={(e) => setBudgetRupees(Number(e.target.value))}
          className="w-full accent-primary"
        />

        {/* Cost Summary Box (Section 5 model) */}
        <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Earner Task Price:</span>
            <span className="font-mono">₹{budgetRupees}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Platform Escrow Fee:</span>
            <span className="font-mono text-emerald-600">+₹{platformFee}</span>
          </div>
          <div className="flex justify-between border-t pt-1.5 font-bold text-foreground">
            <span>Total Payable by Student:</span>
            <span className="font-mono text-primary">₹{totalAmount}</span>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="h-10 w-full text-xs font-semibold">
        {isPending ? "Posting Task..." : "Post Task to Campus Marketplace →"}
      </Button>
    </form>
  );
}
