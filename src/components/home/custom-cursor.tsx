"use client";

import { useEffect, useState } from "react";

/**
 * Custom Cursor Component
 * Provides a tech-forward subtle blue cursor follower on non-touch devices.
 * Automatically respects user preferences for reduced motion and disables on touchscreens.
 */
export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPosition, setTrailingPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check if device supports fine hover (desktop/mouse)
    const mediaQuery = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mediaQuery.matches) return;

    setIsEnabled(true);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Track clickable elements for cursor expand effect
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.closest("button") ||
        target.closest("a") ||
        target.classList.contains("interactive")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isVisible]);

  // Smooth trailing effect for cursor ring
  useEffect(() => {
    if (!isEnabled || !isVisible) return;
    let animationFrameId: number;

    const animateRing = () => {
      setTrailingPosition((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.25,
        y: prev.y + (position.y - prev.y) * 0.25,
      }));
      animationFrameId = requestAnimationFrame(animateRing);
    };

    animationFrameId = requestAnimationFrame(animateRing);
    return () => cancelAnimationFrame(animationFrameId);
  }, [position, isEnabled, isVisible]);

  if (!isEnabled || !isVisible) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none hidden md:block">
      {/* Precision inner dot */}
      <div
        className="custom-cursor-dot"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%) scale(${
            isHovered ? 1.5 : 1
          })`,
          opacity: isVisible ? 1 : 0,
        }}
      />
      {/* Smooth outer follower ring */}
      <div
        className="custom-cursor-ring"
        style={{
          transform: `translate3d(${trailingPosition.x}px, ${trailingPosition.y}px, 0) translate(-50%, -50%) scale(${
            isHovered ? 1.6 : 1
          })`,
          backgroundColor: isHovered ? "rgba(37, 99, 235, 0.08)" : "transparent",
          borderColor: isHovered ? "rgba(37, 99, 235, 0.75)" : "rgba(37, 99, 235, 0.35)",
          opacity: isVisible ? 1 : 0,
        }}
      />
    </div>
  );
}
