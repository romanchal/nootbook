"use client";

import { useState, useTransition } from "react";
import { createCollegeAction, toggleCollegeStatusAction } from "./actions";
import { Button } from "@/components/ui/button";

interface CollegeItem {
  id: string;
  name: string;
  slug: string;
  city: string;
  emailDomain: string | null;
  active: boolean;
  createdAt: Date;
  _count: {
    departments: number;
    users: number;
    resources: number;
    tasks: number;
  };
}

export function CollegesManager({ colleges }: { colleges: CollegeItem[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createCollegeAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setIsAdding(false);
      }
    });
  }

  function handleToggleStatus(collegeId: string, currentActive: boolean) {
    if (!confirm(`Are you sure you want to ${currentActive ? "deactivate" : "activate"} this college?`)) {
      return;
    }

    startTransition(async () => {
      const res = await toggleCollegeStatusAction(collegeId, !currentActive);
      if (res.error) {
        alert(res.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Colleges & Tenants</h3>
          <p className="text-xs text-muted-foreground">
            Multi-tenant isolated campus spaces in Nagpur and Maharashtra.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setIsAdding(!isAdding);
            setError(null);
          }}
        >
          {isAdding ? "Cancel" : "+ Onboard New College"}
        </Button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border bg-card p-5 space-y-3 shadow-2xs text-xs"
        >
          <h4 className="font-semibold text-foreground">Onboard New College Tenant</h4>
          {error && <p className="text-destructive font-medium">{error}</p>}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-muted-foreground mb-1">College Full Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Yeshwantrao Chavan College of Engineering"
                className="h-8 w-full rounded border bg-background px-2.5 text-foreground"
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Slug (URL identifier)</label>
              <input
                type="text"
                name="slug"
                required
                placeholder="e.g. ycce-nagpur"
                className="h-8 w-full rounded border bg-background px-2.5 text-foreground font-mono"
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Email Domain (optional)</label>
              <input
                type="text"
                name="emailDomain"
                placeholder="e.g. ycce.edu"
                className="h-8 w-full rounded border bg-background px-2.5 text-foreground font-mono"
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">City</label>
              <input
                type="text"
                name="city"
                required
                defaultValue="Nagpur"
                className="h-8 w-full rounded border bg-background px-2.5 text-foreground"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Creating..." : "Create Tenant & Seed Departments"}
            </Button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-muted-foreground hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* College List */}
      <div className="rounded-xl border bg-card divide-y overflow-hidden shadow-2xs">
        {colleges.map((c) => (
          <div key={c.id} className="p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">{c.name}</h4>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                      c.active
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.active ? "Active Tenant" : "Disabled"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Slug: <span className="font-mono text-foreground">{c.slug}</span>
                  {c.emailDomain && (
                    <>
                      {" "}· Email: <span className="font-mono text-foreground">{c.emailDomain}</span>
                    </>
                  )}{" "}
                  · {c.city}
                </p>
              </div>

              <Button
                size="sm"
                variant={c.active ? "outline" : "default"}
                disabled={isPending}
                onClick={() => handleToggleStatus(c.id, c.active)}
              >
                {c.active ? "Deactivate" : "Activate"}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 border-t">
              <span>
                Departments: <strong className="text-foreground">{c._count.departments}</strong>
              </span>
              <span>
                Students: <strong className="text-foreground">{c._count.users}</strong>
              </span>
              <span>
                Approved Resources: <strong className="text-foreground">{c._count.resources}</strong>
              </span>
              <span>
                Tasks: <strong className="text-foreground">{c._count.tasks}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
