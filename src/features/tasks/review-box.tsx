"use client";

import { useState, useTransition } from "react";
import { submitTaskReviewAction } from "./actions";
import { Button } from "@/components/ui/button";

interface ReviewBoxProps {
  taskId: string;
  isOwner: boolean;
  earnerName?: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date | string;
    reviewer: { name: string };
  } | null;
}

export function ReviewBox({
  taskId,
  isOwner,
  earnerName = "the earner",
  existingReview,
}: ReviewBoxProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.set("taskId", taskId);
    formData.set("rating", String(rating));
    if (comment.trim()) {
      formData.set("comment", comment.trim());
    }

    startTransition(async () => {
      const res = await submitTaskReviewAction(formData);
      if (res.error) {
        setError(res.error);
      }
    });
  }

  // If already reviewed, display the review card
  if (existingReview) {
    return (
      <div className="rounded-xl border bg-card p-5 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Task Review & Rating</h3>
          <span className="text-xs text-amber-500 font-bold">
            {"★".repeat(existingReview.rating)}
            {"☆".repeat(5 - existingReview.rating)} ({existingReview.rating}/5)
          </span>
        </div>

        {existingReview.comment && (
          <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border italic">
            &ldquo;{existingReview.comment}&rdquo;
          </p>
        )}

        <div className="text-[11px] text-muted-foreground">
          Reviewed by <strong>{existingReview.reviewer.name}</strong> on{" "}
          {new Date(existingReview.createdAt).toLocaleDateString("en-IN")}
        </div>
      </div>
    );
  }

  // If not reviewed yet and caller is the task poster
  if (isOwner) {
    return (
      <div className="rounded-xl border bg-card p-5 space-y-4 shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Leave a Review for {earnerName}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your honest rating helps fellow students discover verified top campus earners.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Rating (1 to 5 Stars)</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-transform hover:scale-110 ${
                    star <= rating ? "text-amber-500" : "text-muted-foreground/30"
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="font-semibold text-foreground ml-2 font-mono">{rating} / 5</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Feedback Comments (optional)</label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="How was the communication, turnaround time, and quality of work delivered?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-md border bg-background p-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Submitting..." : "Submit Review & Rating"}
          </Button>
        </form>
      </div>
    );
  }

  return null;
}
