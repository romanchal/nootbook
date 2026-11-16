"use client";

import { useState } from "react";
import Link from "next/link";
import { uploadResource } from "./actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ResourceType } from "@/generated/prisma/client";
import { RESOURCE_TYPE_META } from "./format";

interface SubjectOption {
  id: string;
  name: string;
  code: string | null;
  departmentName: string;
  semester: number;
}

interface UploadFormProps {
  subjects: SubjectOption[];
  preselectedSubjectId?: string;
}

export function UploadForm({ subjects, preselectedSubjectId }: UploadFormProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(preselectedSubjectId ?? "");
  const [type, setType] = useState<ResourceType>("OLD_PAPER");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [academicYear, setAcademicYear] = useState("2024-25");
  const [examType, setExamType] = useState("End-Sem");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }
    if (!selectedSubjectId) {
      setError("Please select a subject.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subjectId", selectedSubjectId);
    formData.append("type", type);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("academicYear", academicYear);
    formData.append("examType", examType);
    formData.append("tags", tags);

    const res = await uploadResource(formData);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold tracking-tight">Upload Submitted for Review!</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Your file has been placed in the <span className="font-semibold text-foreground">Pending Queue</span>.
          Your Class Admin will review and verify it for academic accuracy before it goes live in the library.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            onClick={() => {
              setSuccess(false);
              setTitle("");
              setDescription("");
              setFile(null);
            }}
            variant="outline"
          >
            Upload Another Resource
          </Button>
          <Link href="/library" className={buttonVariants({ variant: "default" })}>
            Return to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-card p-6 shadow-xs">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Subject Selector */}
      <div className="space-y-2">
        <Label htmlFor="subjectSelect">Subject</Label>
        <select
          id="subjectSelect"
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">-- Choose Subject --</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code ?? "Core"}) — {s.departmentName} Sem {s.semester}
            </option>
          ))}
        </select>
      </div>

      {/* Resource Category */}
      <div className="space-y-2">
        <Label htmlFor="typeSelect">Resource Category</Label>
        <select
          id="typeSelect"
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {Object.entries(RESOURCE_TYPE_META).map(([val, meta]) => (
            <option key={val} value={val}>
              {meta.label}
            </option>
          ))}
        </select>
      </div>

      {/* File Upload Picker */}
      <div className="space-y-2">
        <Label htmlFor="fileInput">Document or File (Max 25 MB)</Label>
        <Input
          id="fileInput"
          type="file"
          accept=".pdf,.docx,.doc,.pptx,.ppt,.jpg,.jpeg,.png,.webp"
          required
          onChange={(e) => {
            const selected = e.target.files?.[0];
            setFile(selected ?? null);
          }}
          className="file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-primary"
        />
        <p className="text-[11px] text-muted-foreground">
          Accepted: PDF, Word, PowerPoint, or clear scanner images.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="titleInput">Resource Title</Label>
        <Input
          id="titleInput"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          maxLength={120}
          placeholder="e.g., Winter 2024 End-Sem Question Paper"
        />
      </div>

      {/* Academic Year & Exam Type */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="academicYearInput">Academic Year</Label>
          <Input
            id="academicYearInput"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="e.g. 2024-25"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="examTypeInput">Exam Type / Tag</Label>
          <Input
            id="examTypeInput"
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            placeholder="e.g. End-Sem, Mid-Term, Practical"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="descInput">Description (Optional)</Label>
        <Input
          id="descInput"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          placeholder="e.g., Contains detailed marking scheme and solved numericals"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tagsInput">Tags (Optional, comma-separated)</Label>
        <Input
          id="tagsInput"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., Solved, Topper Notes, Unit 1"
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting for Review…" : "Submit Resource for Verification"}
      </Button>
    </form>
  );
}
