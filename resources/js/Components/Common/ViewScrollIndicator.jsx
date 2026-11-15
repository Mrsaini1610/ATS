import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * ViewScrollIndicator
 * Floating bottom-center indicator button for any scrollable detail view panel.
 * - Stays pinned at the EXACT same location for both "Scroll down" and "Go to top".
 * - Centers via flexbox without transform conflicts.
 * - Smoothly scrolls the container on click.
 */
export default function ViewScrollIndicator({
  containerRef,
  threshold = 80,
  scrollStep = 320,
  className = "",
  bottomOffsetClass = "bottom-12",
}) {
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const check = () => {
      // Check if container has vertical scrollable overflow
      const hasOverflow = el.scrollHeight > el.clientHeight + 25;
      setCanScroll(hasOverflow);
      setIsScrolledDown(el.scrollTop > threshold);
    };

    // Check after initial mount and slight layout delay
    check();
    const t = setTimeout(check, 120);

    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);

    return () => {
      clearTimeout(t);
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [containerRef, threshold]);

  if (!canScroll) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const el = containerRef?.current;
    if (!el) return;

    if (isScrolledDown) {
      el.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ top: scrollStep, behavior: "smooth" });
    }
  };

  return (
    <div
      className={`absolute ${bottomOffsetClass} inset-x-0 flex justify-center pointer-events-none z-30 ${className}`}
    >
      <button
        type="button"
        onClick={handleClick}
        className={`pointer-events-auto h-8 w-28 rounded-full text-[11px] font-bold shadow-lg transition-colors duration-200 cursor-pointer border select-none backdrop-blur-md flex items-center justify-center gap-1.5 ${
          isScrolledDown
            ? "bg-slate-900/95 hover:bg-slate-900 text-white border-slate-700 shadow-slate-950/30 ring-1 ring-white/10"
            : "bg-white/95 hover:bg-white text-blue-600 border-blue-200 shadow-blue-500/20 ring-1 ring-blue-500/10"
        }`}
        title={isScrolledDown ? "Go to top" : "Scroll down to view details"}
        aria-label={isScrolledDown ? "Go to top" : "Scroll down to view details"}
      >
        {isScrolledDown ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Go to top</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-blue-600 shrink-0 animate-bounce" />
            <span className="whitespace-nowrap">Scroll down</span>
          </>
        )}
      </button>
    </div>
  );
}
