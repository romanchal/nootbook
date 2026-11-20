"use client";

import { useEffect, useState } from "react";

/**
 * Preloader Component
 * Elegant loading animation displayed during initial client mounting.
 * Fades out smoothly within 400ms once document is ready.
 */
export function Preloader() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !loading) return null;

  return (
    <div
      aria-label="Loading Nootbook Academic Portal"
      role="status"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-opacity duration-300"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Animated Emblem */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-blue-600/20 animate-ping opacity-75" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-500/25">
            <span className="text-2xl">📖</span>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            Nootbook
          </h2>
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            PBCOE Autonomous
          </p>
        </div>

        {/* Subtle Progress Bar */}
        <div className="h-1 w-36 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full w-full bg-blue-600 origin-left animate-pulse" />
        </div>
      </div>
    </div>
  );
}
