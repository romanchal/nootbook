"use client";

import { useState } from "react";
import { downloadResource } from "./actions";
import { Button } from "@/components/ui/button";

interface ResourceDownloadButtonProps {
  resourceId: string;
  initialDownloads: number;
  fileName: string;
}

export function ResourceDownloadButton({
  resourceId,
  initialDownloads,
  fileName,
}: ResourceDownloadButtonProps) {
  const [downloads, setDownloads] = useState(initialDownloads);
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await downloadResource(resourceId);
      if (res?.downloadCount) {
        setDownloads(res.downloadCount);
      }
      
      const fileUrl = res?.fileKey ? `/${res.fileKey}` : "/papers/PBCOE-Semester-3-Consolidated-Exam-Papers.pdf";
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      size="sm"
      variant="default"
      className="gap-1.5 bg-blue-700 hover:bg-blue-800 text-white shadow-xs cursor-pointer"
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      {loading ? "Downloading…" : `Download (${downloads})`}
    </Button>
  );
}
