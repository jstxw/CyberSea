"use client";

import { useEffect, useRef, useCallback } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const lastHoveredRef = useRef<Element | null>(null);
  const rafRef = useRef<number | null>(null);

  const updateCursor = useCallback((e: MouseEvent) => {
    if (cursorRef.current) {
      cursorRef.current.style.left = `${e.clientX}px`;
      cursorRef.current.style.top = `${e.clientY}px`;
    }

    const target = e.target as HTMLElement;
    const interactive = target.closest('a, button, [role="button"], input, select, textarea');

    if (interactive && interactive !== lastHoveredRef.current) {
      const isInNav = interactive.closest('nav');
      const isInOnboarding = interactive.closest('[data-no-cursor]');

      if (isInNav || isInOnboarding) {
        if (expandedRef.current) {
          expandedRef.current.style.display = 'none';
        }
        if (cursorRef.current) {
          cursorRef.current.style.opacity = '1';
        }
        lastHoveredRef.current = null;
      } else {
        const rect = interactive.getBoundingClientRect();
        if (expandedRef.current) {
          expandedRef.current.style.display = 'block';
          expandedRef.current.style.left = `${rect.left - 6}px`;
          expandedRef.current.style.top = `${rect.top - 6}px`;
          expandedRef.current.style.width = `${rect.width + 12}px`;
          expandedRef.current.style.height = `${rect.height + 12}px`;
        }
        if (cursorRef.current) {
          cursorRef.current.style.opacity = '0';
        }
        lastHoveredRef.current = interactive;
      }
    } else if (!interactive && lastHoveredRef.current) {
      if (expandedRef.current) {
        expandedRef.current.style.display = 'none';
      }
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '1';
      }
      lastHoveredRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => updateCursor(e));
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateCursor]);

  return (
    <>
      {/* Main cursor */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ left: 0, top: 0, zIndex: 99999, transition: 'opacity 150ms' }}
      >
        {/* Center dot */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500" />

        {/* Corner brackets */}
        <div className="w-10 h-10 relative">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500" />
        </div>
      </div>

      {/* Expanded cursor around hovered element */}
      <div
        ref={expandedRef}
        className="fixed pointer-events-none"
        style={{ display: 'none', zIndex: 99999, transition: 'all 200ms ease-out' }}
      >
        {/* Top-left corner */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500" />
        {/* Top-right corner */}
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500" />
        {/* Bottom-left corner */}
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500" />
        {/* Bottom-right corner */}
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500" />

        {/* Center dot */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500" />
      </div>
    </>
  );
}
