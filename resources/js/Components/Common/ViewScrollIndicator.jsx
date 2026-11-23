import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * ViewScrollIndicator
 * Floating bottom-center indicator button for any scrollable detail view panel.
 * - Shows "Scroll down" ONLY when at the TOP.
 * - Shows "Go to up" ONLY when at the BOTTOM.
 * - Hides while scrolling in the middle.
 * - Smoothly scrolls the container on click.
 */
export default function ViewScrollIndicator({
  containerRef,
  threshold = 60,
  bottomThreshold = 60,
  scrollStep = 340,
  className = "",
  bottomOffsetClass = "bottom-12",
}) {
  // "top" | "bottom" | "middle"
  const [scrollPosition, setScrollPosition] = useState("top");
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const check = () => {
      // Check if container has vertical scrollable overflow
      const hasOverflow = el.scrollHeight > el.clientHeight + 30;
      setCanScroll(hasOverflow);

      if (!hasOverflow) {
        setScrollPosition("middle");
        return;
      }

      const isAtTop = el.scrollTop <= threshold;
      const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - bottomThreshold;

      if (isAtTop) {
        setScrollPosition("top");
      } else if (isAtBottom) {
        setScrollPosition("bottom");
      } else {
        // While user is in the middle, hide the button so content is unobstructed
        setScrollPosition("middle");
      }
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
  }, [containerRef, threshold, bottomThreshold]);

  // Only render when at top or at bottom
  if (!canScroll || scrollPosition === "middle") return null;

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const el = containerRef?.current;
    if (!el) return;

    if (scrollPosition === "bottom") {
      el.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Scroll down by step or to bottom
      el.scrollBy({ top: scrollStep, behavior: "smooth" });
    }
  };

  const isBottom = scrollPosition === "bottom";

  return (
    <div
      className={`absolute ${bottomOffsetClass} inset-x-0 flex justify-center pointer-events-none z-30 transition-all duration-300 ${className}`}
    >
      <button
        type="button"
        onClick={handleClick}
        className={`pointer-events-auto h-8 w-28 rounded-full text-[11px] font-bold shadow-lg transition-all duration-200 cursor-pointer border select-none backdrop-blur-md flex items-center justify-center gap-1.5 active:scale-95 ${
          isBottom
            ? "bg-slate-900/95 hover:bg-slate-900 text-white border-slate-700 shadow-slate-950/30 ring-1 ring-white/10"
            : "bg-white/95 hover:bg-white text-blue-600 border-blue-200 shadow-blue-500/20 ring-1 ring-blue-500/10"
        }`}
        title={isBottom ? "Go to up" : "Scroll down to view details"}
        aria-label={isBottom ? "Go to up" : "Scroll down to view details"}
      >
        {isBottom ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Go to up</span>
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
