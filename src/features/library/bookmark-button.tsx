"use client";

import { useState, useTransition } from "react";
import { toggleBookmarkAction } from "./actions";
import { Button } from "@/components/ui/button";

interface BookmarkButtonProps {
  resourceId: string;
  initialBookmarked?: boolean;
  size?: "default" | "sm" | "xs" | "lg" | "icon" | "icon-sm" | "icon-xs" | "icon-lg";
  showLabel?: boolean;
}

export function BookmarkButton({
  resourceId,
  initialBookmarked = false,
  size = "sm",
  showLabel = false,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    // Optimistic toggle
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    startTransition(async () => {
      const result = await toggleBookmarkAction(resourceId);
      if (result.error || result.bookmarked === undefined) {
        // Rollback on error
        setIsBookmarked(!nextState);
        console.error("Bookmark toggle error:", result.error);
      } else {
        setIsBookmarked(result.bookmarked);
      }
    });
  }

  return (
    <Button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      size={size}
      variant="ghost"
      aria-label={isBookmarked ? "Remove bookmark" : "Save to bookmarks"}
      title={isBookmarked ? "Remove bookmark" : "Save to bookmarks"}
      className={`transition-all ${
        isBookmarked
          ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <svg
        className={`h-4 w-4 transition-transform ${isPending ? "scale-90" : "scale-100"}`}
        fill={isBookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
        />
      </svg>
      {showLabel && (
        <span className="ml-1 text-xs font-medium">
          {isBookmarked ? "Saved" : "Save"}
        </span>
      )}
    </Button>
  );
}
