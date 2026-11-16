"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { signInWithPassword, signUpWithPassword } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ThemeColor = "amber" | "cyan" | "rose" | "mint" | "moonlight";

interface ColorThemeMeta {
  name: string;
  dot: string;
  accent: string;
  glow: string;
  beamStart: string;
  beamMid: string;
  rgb: string;
}

const THEMES: Record<ThemeColor, ColorThemeMeta> = {
  amber: {
    name: "Amber Warmth",
    dot: "#ffab3d",
    accent: "#ffab3d",
    glow: "#ffe194",
    beamStart: "rgba(255, 220, 130, 0.55)",
    beamMid: "rgba(255, 195, 90, 0.28)",
    rgb: "255, 205, 120",
  },
  cyan: {
    name: "Cyber Focus",
    dot: "#00f0ff",
    accent: "#00f0ff",
    glow: "#a6f9ff",
    beamStart: "rgba(160, 245, 255, 0.55)",
    beamMid: "rgba(0, 220, 255, 0.28)",
    rgb: "140, 245, 255",
  },
  rose: {
    name: "Sunset Rose",
    dot: "#ff3385",
    accent: "#ff3385",
    glow: "#ffa3c7",
    beamStart: "rgba(255, 160, 205, 0.55)",
    beamMid: "rgba(255, 70, 150, 0.28)",
    rgb: "255, 160, 200",
  },
  mint: {
    name: "Emerald Campus",
    dot: "#00e676",
    accent: "#00e676",
    glow: "#b9f6ca",
    beamStart: "rgba(180, 255, 215, 0.55)",
    beamMid: "rgba(0, 225, 115, 0.28)",
    rgb: "160, 255, 200",
  },
  moonlight: {
    name: "Moonlight Night",
    dot: "#d8e5ff",
    accent: "#d8e5ff",
    glow: "#ffffff",
    beamStart: "rgba(255, 255, 255, 0.55)",
    beamMid: "rgba(210, 230, 255, 0.28)",
    rgb: "220, 235, 255",
  },
};

export function InteractiveNootbookLogin() {
  const [isOpen, setIsOpen] = useState(true);
  const [theme, setTheme] = useState<ThemeColor>("amber");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Form State: Google OAuth & ID + Password
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Bookmark Elastic Drag Geometry
  const ANCHOR_X = 220;
  const ANCHOR_Y = 270;
  const REST_X = 220;
  const REST_Y = 360;
  const MAX_DRAG_Y = 460;
  const TRIGGER_PULL = 32;

  const [cordPos, setCordPos] = useState({ x: REST_X, y: REST_Y });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sound Synthesizer via Web Audio API
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, []);

  const playPluckAndSnap = useCallback((turningOn: boolean) => {
    if (!soundEnabled) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const now = ctx.currentTime;

      // Silk bookmark tension pluck
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);
      oscGain.gain.setValueAtTime(0.3, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);

      // Magnetic leather clasp / book open snap
      const snap = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snap.type = "sine";
      snap.frequency.setValueAtTime(turningOn ? 1650 : 1300, now + 0.02);
      snap.frequency.exponentialRampToValueAtTime(260, now + 0.06);
      snapGain.gain.setValueAtTime(0.35, now + 0.02);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
      snap.connect(snapGain);
      snapGain.connect(ctx.destination);
      snap.start(now + 0.02);
      snap.stop(now + 0.07);

      // Warm knowledge resonance hum
      if (turningOn) {
        const hum = ctx.createOscillator();
        const humGain = ctx.createGain();
        hum.type = "sine";
        hum.frequency.setValueAtTime(130, now + 0.05);
        humGain.gain.setValueAtTime(0.001, now);
        humGain.gain.linearRampToValueAtTime(0.06, now + 0.08);
        humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        hum.connect(humGain);
        humGain.connect(ctx.destination);
        hum.start(now + 0.05);
        hum.stop(now + 0.4);
      }
    } catch {
      // Audio autoplay gracefully suppressed if blocked
    }
  }, [soundEnabled, initAudio]);

  const toggleNootbook = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      playPluckAndSnap(next);
      return next;
    });
  }, [playPluckAndSnap]);

  // Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY - cordPos.y;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    initAudio();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newY = Math.min(Math.max(e.clientY - dragStartY.current, REST_Y), MAX_DRAG_Y);
    setCordPos((prev) => ({ ...prev, y: newY }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already ended
    }

    const pullDist = cordPos.y - REST_Y;
    if (pullDist >= TRIGGER_PULL) {
      toggleNootbook();
    } else {
      playPluckAndSnap(isOpen);
    }

    // Spring release bounce animation
    const startTime = performance.now();
    const startY = cordPos.y;
    const animateBounce = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      if (elapsed < 0.6) {
        // Damped harmonic oscillation
        const decay = Math.exp(-6 * elapsed);
        const y = REST_Y + (startY - REST_Y) * decay * Math.cos(20 * elapsed);
        setCordPos({ x: REST_X, y });
        requestAnimationFrame(animateBounce);
      } else {
        setCordPos({ x: REST_X, y: REST_Y });
      }
    };
    requestAnimationFrame(animateBounce);
  };

  // Canvas Dust Particles Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.6,
      vx: (Math.random() - 0.4) * 0.3,
      vy: -Math.random() * 0.4 - 0.15,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const currentTheme = THEMES[theme];
      const factor = isOpen ? 1 : 0.08;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const a = (Math.sin(p.pulse) * 0.3 + 0.7) * p.alpha * factor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${currentTheme.rgb}, ${a})`;
        if (isOpen) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = `rgba(${currentTheme.rgb}, 0.5)`;
        }
        ctx.fill();
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isOpen, theme]);

  // Google Sign-In
  async function handleGoogleSignIn() {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/confirm`,
        },
      });
      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("Failed to fetch") ||
        msg.includes("ENOTFOUND") ||
        msg.includes("ERR_NAME_NOT_RESOLVED")
      ) {
        setError(
          "Supabase project is currently PAUSED. Open https://supabase.com/dashboard and click 'Restore project'.",
        );
      } else {
        setError(msg);
      }
      setLoading(false);
    }
  }

  // ID & Password Sign-In
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const res = await signInWithPassword({ email, password });
      if (res?.error) {
        setError(res.error);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        throw err;
      }
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  // ID & Password Sign-Up
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const res = await signUpWithPassword({ email, password, name });
      if (res?.error) {
        if (res.error.toLowerCase().includes("already registered")) {
          setError(
            "This email is already registered! Switched to Sign In tab — enter your password to sign in.",
          );
          setAuthMode("signin");
        } else {
          setError(res.error);
        }
      } else if (res?.message) {
        setSuccessMessage(res.message);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        throw err;
      }
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  const currentMeta = THEMES[theme];
  const stretchRatio = Math.max(1, (cordPos.y - ANCHOR_Y) / (REST_Y - ANCHOR_Y));
  const ribbonWidth = Math.max(2, 3.4 / Math.sqrt(stretchRatio));
  const bookTilt = isDragging ? ((cordPos.y - REST_Y) / (MAX_DRAG_Y - REST_Y)) * 3 : 0;

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0c0e12] px-4 py-8 text-[#f0f3f8] transition-colors duration-700"
      style={{
        backgroundColor: isOpen ? "#151820" : "#0c0e12",
      }}
    >
      {/* Background Ambient Knowledge Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
        style={{
          opacity: isOpen ? 0.8 : 0,
          background: `radial-gradient(circle at 40% 45%, ${currentMeta.beamMid}, transparent 65%)`,
        }}
      />

      {/* Floating Canvas Dust */}
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-10 h-full w-full" />

      {/* Top Quick Controls: Theme Colors & Sound Toggle */}
      <header className="fixed top-5 inset-x-6 z-50 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-md transition-all hover:bg-white/15 hover:text-white"
        >
          <span>←</span>
          <span>Home</span>
        </Link>

        <div className="pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
            {(Object.keys(THEMES) as ThemeColor[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                title={THEMES[t].name}
                className={`h-4.5 w-4.5 rounded-full transition-all cursor-pointer ${
                  theme === t ? "scale-125 ring-2 ring-white" : "opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: THEMES[t].dot }}
                aria-label={THEMES[t].name}
              />
            ))}
          </div>

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              initAudio();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white cursor-pointer"
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <svg width="16" height="16" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg width="16" height="16" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="relative z-20 flex w-full max-w-5xl flex-col items-center justify-center gap-6 md:flex-row md:gap-10 pt-16 md:pt-0">
        {/* ============================================================== */}
        {/* High-Quality Nootbook Vector Artwork Stage                     */}
        {/* ============================================================== */}
        <div className="relative flex flex-col items-center justify-center shrink-0 w-[280px] sm:w-[340px] md:w-[380px]">
          <svg
            className="h-[340px] sm:h-[420px] w-full overflow-visible drop-shadow-2xl transition-all duration-500"
            viewBox="0 0 420 520"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Premium Leather Cover Gradient */}
              <linearGradient id="leatherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e2738" />
                <stop offset="40%" stopColor="#141a27" />
                <stop offset="100%" stopColor="#0a0d14" />
              </linearGradient>

              {/* Ultra High Quality Gold Foil */}
              <linearGradient id="goldFoilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff8d4" />
                <stop offset="30%" stopColor="#f5c754" />
                <stop offset="65%" stopColor="#b88320" />
                <stop offset="100%" stopColor="#fce28b" />
              </linearGradient>

              <linearGradient id="paperEdgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f7f0e4" />
                <stop offset="45%" stopColor="#e3d4b6" />
                <stop offset="85%" stopColor="#c5a266" />
                <stop offset="100%" stopColor="#9a722e" />
              </linearGradient>

              {/* Volumetric Light Beam Shooting to Card */}
              <linearGradient id="beamGrad" x1="0%" y1="20%" x2="100%" y2="65%">
                <stop offset="0%" stopColor={currentMeta.beamStart} />
                <stop offset="35%" stopColor={currentMeta.beamMid} />
                <stop offset="70%" stopColor="rgba(255, 175, 60, 0.08)" />
                <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
              </linearGradient>

              {/* Luminous Open Pages */}
              <radialGradient id="pageGlowGrad" cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="40%" stopColor={currentMeta.glow} stopOpacity="0.85" />
                <stop offset="75%" stopColor={currentMeta.accent} stopOpacity="0.6" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>

              {/* Soft Beam Filter */}
              <filter id="softGlow" x="-15%" y="-15%" width="130%" height="130%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>

            {/* Ground Desk Shadow */}
            <ellipse cx="210" cy="460" rx="140" ry="20" fill="rgba(0, 0, 0, 0.65)" />

            {/* Volumetric Light Beam (Appears when Nootbook is open) */}
            {isOpen && (
              <polygon
                points="230,225 330,170 860,420 330,510"
                fill="url(#beamGrad)"
                filter="url(#softGlow)"
                className="pointer-events-none transition-opacity duration-500"
              />
            )}

            {/* ==================================================== */}
            {/* 1. CLOSED NOOTBOOK (Clean, uncluttered, "NOOTBOOK")   */}
            {/* ==================================================== */}
            <g
              id="bookClosed"
              style={{
                opacity: isOpen ? 0 : 1,
                transform: `rotate(${bookTilt}deg)`,
                transformOrigin: "110px 240px",
                transition: "opacity 350ms ease, transform 150ms ease",
                pointerEvents: isOpen ? "none" : "auto",
              }}
              onClick={toggleNootbook}
              className="cursor-pointer"
            >
              {/* Spine Shadow */}
              <path d="M 98 132 L 122 118 L 122 384 L 98 398 Z" fill="#090c12" />

              {/* Gilded Page Block Edge */}
              <path d="M 292 126 L 314 138 L 314 380 L 292 368 Z" fill="url(#paperEdgeGrad)" stroke="#87682d" strokeWidth="0.8" />
              <line x1="312" y1="145" x2="312" y2="375" stroke="#ffe8aa" strokeWidth="0.6" strokeOpacity="0.4" />
              <line x1="306" y1="140" x2="306" y2="370" stroke="#77561f" strokeWidth="0.6" strokeOpacity="0.5" />
              <line x1="300" y1="135" x2="300" y2="365" stroke="#ffe8aa" strokeWidth="0.6" strokeOpacity="0.4" />
              <path d="M 122 384 L 140 394 L 314 380 L 292 368 Z" fill="url(#paperEdgeGrad)" stroke="#87682d" strokeWidth="0.6" />

              {/* Luxury Leather Front Cover */}
              <rect x="110" y="118" width="186" height="254" rx="12" fill="url(#leatherGrad)" stroke="#090c12" strokeWidth="2.2" />

              {/* Leather Spine with Stitches */}
              <path d="M 110 118 L 128 118 L 128 372 L 110 372 Z" fill="#141924" stroke="#090c12" strokeWidth="1.2" />
              <line x1="128" y1="118" x2="128" y2="372" stroke="#485772" strokeWidth="1.5" strokeDasharray="4,4" />

              {/* Brass Corner Protectors */}
              <polygon points="110,118 138,118 110,146" fill="url(#goldFoilGrad)" stroke="#7a5513" strokeWidth="0.8" />
              <polygon points="296,118 268,118 296,146" fill="url(#goldFoilGrad)" stroke="#7a5513" strokeWidth="0.8" />
              <polygon points="296,372 268,372 296,344" fill="url(#goldFoilGrad)" stroke="#7a5513" strokeWidth="0.8" />
              <polygon points="110,372 138,372 110,344" fill="url(#goldFoilGrad)" stroke="#7a5513" strokeWidth="0.8" />

              {/* Refined Gold Foil Border */}
              <rect x="136" y="138" width="134" height="214" rx="8" fill="none" stroke="url(#goldFoilGrad)" strokeWidth="1.2" strokeOpacity="0.85" />
              <rect x="140" y="142" width="126" height="206" rx="6" fill="none" stroke="url(#goldFoilGrad)" strokeWidth="0.6" strokeDasharray="5,2.5" strokeOpacity="0.7" />

              {/* Corner Dots */}
              <circle cx="145" cy="147" r="2.5" fill="url(#goldFoilGrad)" />
              <circle cx="261" cy="147" r="2.5" fill="url(#goldFoilGrad)" />
              <circle cx="145" cy="343" r="2.5" fill="url(#goldFoilGrad)" />
              <circle cx="261" cy="343" r="2.5" fill="url(#goldFoilGrad)" />

              {/* PURE, BOLD, ELEGANT "NOOTBOOK" TITLE (Clean, No extra clutter) */}
              <g transform="translate(0, 5)">
                <text
                  x="203"
                  y="250"
                  textAnchor="middle"
                  fontFamily="'Plus Jakarta Sans', serif"
                  fontSize="22"
                  fontWeight="800"
                  letterSpacing="5"
                  fill="url(#goldFoilGrad)"
                >
                  NOOTBOOK
                </text>
              </g>
            </g>

            {/* ==================================================== */}
            {/* 2. OPEN NOOTBOOK (Revealed with knowledge radiance)  */}
            {/* ==================================================== */}
            <g
              id="bookOpen"
              style={{
                opacity: isOpen ? 1 : 0,
                transition: "opacity 450ms ease",
                pointerEvents: isOpen ? "auto" : "none",
              }}
              onClick={toggleNootbook}
              className="cursor-pointer"
            >
              {/* Hardcover Wings */}
              <path d="M 52 144 Q 130 134 210 148 L 210 376 Q 130 362 52 376 Z" fill="#141924" stroke="#090c12" strokeWidth="2" />
              <path d="M 210 148 Q 290 134 368 144 L 368 376 Q 290 362 210 376 Z" fill="#141924" stroke="#090c12" strokeWidth="2" />

              {/* Left Parchment Page */}
              <path d="M 64 150 Q 135 140 208 152 L 208 368 Q 135 356 64 368 Z" fill="#fdfbf5" stroke="#dec99e" strokeWidth="1.2" />
              <path d="M 82 176 L 190 176 M 82 192 L 180 192 M 82 208 L 194 208 M 82 224 L 165 224" stroke="#687892" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
              <text x="84" y="252" fontFamily="'Plus Jakarta Sans', monospace" fontSize="8.5" fontWeight="600" fill="#425470">
                ∫ f(x)dx = ∑ aₙ eⁱⁿˣ
              </text>
              <text x="84" y="270" fontFamily="'Plus Jakarta Sans', monospace" fontSize="7.5" fontWeight="600" fill="#526582">
                O(n log n) · DBMS ER-Schema
              </text>

              {/* Right Luminous Page */}
              <path d="M 212 152 Q 285 140 356 150 L 356 368 Q 285 356 212 368 Z" fill="#fdfbf5" stroke={currentMeta.accent} strokeWidth="1.4" />
              <ellipse cx="284" cy="254" rx="64" ry="46" fill="url(#pageGlowGrad)" opacity={isOpen ? 0.9 : 0} />

              {/* Right Page Watermark: NOOTBOOK */}
              <circle cx="284" cy="242" r="26" fill="none" stroke={currentMeta.accent} strokeWidth="1.4" opacity="0.8" />
              <text x="284" y="246" textAnchor="middle" fontFamily="'Plus Jakarta Sans', serif" fontSize="11" fontWeight="800" letterSpacing="2" fill="#2d2008">
                NOOTBOOK
              </text>

              {/* Center Crease Binding */}
              <line x1="210" y1="148" x2="210" y2="376" stroke="#997a3f" strokeWidth="2.5" />
            </g>

            {/* ==================================================== */}
            {/* 3. ELASTIC SILK BOOKMARK RIBBON (Interactive Drag)   */}
            {/* ==================================================== */}
            <g className="cursor-grab active:cursor-grabbing">
              {/* Silk Ribbon Path */}
              <path
                d={`M ${ANCHOR_X} ${ANCHOR_Y} Q ${(ANCHOR_X + cordPos.x) / 2} ${(ANCHOR_Y + cordPos.y) / 2} ${cordPos.x} ${cordPos.y}`}
                stroke="#d32f2f"
                strokeWidth={ribbonWidth}
                strokeLinecap="round"
                fill="none"
              />

              {/* Bookmark Medal Pendant ('N') & Tassel */}
              <g
                transform={`translate(${cordPos.x}, ${cordPos.y})`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="touch-none select-none"
              >
                {/* Aura Glow on Ribbon Bead */}
                <circle cx="0" cy="0" r="18" fill={currentMeta.accent} opacity={isOpen ? 0.4 : 0} />

                {/* Brass Medal */}
                <circle cx="0" cy="0" r="11" fill="url(#goldFoilGrad)" stroke="#7a5513" strokeWidth="1.2" />
                <circle cx="0" cy="0" r="8.5" fill="none" stroke="#ffeaa7" strokeWidth="0.7" />
                <text x="0" y="4" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10.5" fontWeight="800" fill="#4a3103">
                  N
                </text>

                {/* Silk Ribbon Tassel */}
                <path d="M -4 11 L 4 11 L 6 26 L -6 26 Z" fill="#c62828" stroke="#8e0000" strokeWidth="0.6" />
                <line x1="-3" y1="26" x2="-3" y2="29" stroke="#ef5350" strokeWidth="0.8" />
                <line x1="0" y1="26" x2="0" y2="30" stroke="#ef5350" strokeWidth="0.8" />
                <line x1="3" y1="26" x2="3" y2="29" stroke="#ef5350" strokeWidth="0.8" />

                {/* Large Hit Area for Easy Touch on Mobile Phones */}
                <circle cx="0" cy="8" r="36" fill="transparent" />
              </g>
            </g>
          </svg>

          {/* Interactive Toggle Hint Button */}
          <button
            type="button"
            onClick={toggleNootbook}
            className="mt-3 text-xs font-semibold text-white/70 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 backdrop-blur-md"
          >
            <span>{isOpen ? "📖 Click to close cover" : "✨ Click or pull ribbon to open"}</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* Real Working Next.js / Supabase Login Card                     */}
        {/* ============================================================== */}
        <div
          className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#12161c]/90 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl transition-all duration-500 opacity-100 translate-y-0 scale-100 pointer-events-auto"
          style={{
            boxShadow: isOpen
              ? `-20px 0 60px -15px ${currentMeta.beamMid}, 0 25px 60px rgba(0, 0, 0, 0.6)`
              : "0 25px 60px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div className="w-full space-y-4">
            <header className="space-y-1.5 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary">
                NOOTBOOK · NAGPUR
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Student Portal</h1>
              <p className="text-xs text-white/60">
                Sign in with your Google account or college ID and password.
              </p>
            </header>

            {/* 1. Continue with Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/5 font-semibold text-white transition-all hover:bg-white/10 hover:border-white/25 active:scale-[0.98] disabled:opacity-50 text-xs shadow-sm cursor-pointer"
            >
              <svg width="18" height="18" className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* 2. Visual Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="w-full border-t border-white/10" />
              <span className="absolute bg-[#12161c] px-2.5 text-[10px] uppercase tracking-wider text-white/40">
                or with ID & password
              </span>
            </div>

            {/* 3. Auth Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 rounded-lg py-1.5 font-semibold transition-all cursor-pointer ${
                  authMode === "signin"
                    ? "bg-white/15 text-white shadow-xs"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 rounded-lg py-1.5 font-semibold transition-all cursor-pointer ${
                  authMode === "signup"
                    ? "bg-white/15 text-white shadow-xs"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Feedback Messages */}
            {error && (
              <div className="rounded-lg bg-destructive/15 border border-destructive/20 p-2.5 text-xs text-rose-300">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/20 p-2.5 text-xs text-emerald-300">
                {successMessage}
              </div>
            )}

            {/* 4. Form for Sign In or Sign Up */}
            <form onSubmit={authMode === "signin" ? handleSignIn : handleSignUp} className="space-y-3.5">
              {authMode === "signup" && (
                <div className="space-y-1 text-left">
                  <Label htmlFor="signupName" className="text-[11px] text-white/80">
                    Full Name
                  </Label>
                  <Input
                    id="signupName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    className="h-9 border-white/10 bg-white/5 text-xs text-white placeholder:text-white/30 focus-visible:ring-primary"
                  />
                </div>
              )}

              <div className="space-y-1 text-left">
                <Label htmlFor="loginEmail" className="text-[11px] text-white/80">
                  College Email or ID
                </Label>
                <Input
                  id="loginEmail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="h-9 border-white/10 bg-white/5 text-xs text-white placeholder:text-white/30 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1 text-left">
                <Label htmlFor="loginPassword" className="text-[11px] text-white/80">
                  Password
                </Label>
                <Input
                  id="loginPassword"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authMode === "signup" ? "At least 6 characters" : "••••••••"}
                  className="h-9 border-white/10 bg-white/5 text-xs text-white placeholder:text-white/30 focus-visible:ring-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 font-semibold shadow-lg transition-transform active:scale-[0.98] cursor-pointer mt-1"
                style={{ backgroundColor: currentMeta.accent, color: "#111" }}
              >
                {loading
                  ? authMode === "signin"
                    ? "Signing in…"
                    : "Creating account…"
                  : authMode === "signin"
                    ? "Sign In to Nootbook →"
                    : "Create Account →"}
              </Button>
            </form>

            <div className="border-t border-white/10 pt-2.5 text-center text-[10px] text-white/40">
              Multi-tenant academic library & task marketplace
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
