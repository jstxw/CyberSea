"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const [hoveredElement, setHoveredElement] = useState<DOMRect | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }

      // Check if hovering over interactive element
      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, [role="button"], input, select, textarea');

      if (interactive) {
        const rect = interactive.getBoundingClientRect();
        setHoveredElement(rect);
      } else {
        setHoveredElement(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {/* Main cursor */}
      <div
        ref={cursorRef}
        className={`fixed pointer-events-none z-9999 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150 ${hoveredElement ? 'opacity-0' : 'opacity-100'}`}
        style={{ left: 0, top: 0 }}
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
      {hoveredElement && (
        <div
          ref={expandedRef}
          className="fixed pointer-events-none z-9999 transition-all duration-200 ease-out"
          style={{
            left: hoveredElement.left - 6,
            top: hoveredElement.top - 6,
            width: hoveredElement.width + 12,
            height: hoveredElement.height + 12,
          }}
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
      )}
    </>
  );
}
