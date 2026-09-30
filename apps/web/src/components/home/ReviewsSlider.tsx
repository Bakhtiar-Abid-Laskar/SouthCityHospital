"use client";

/**
 * ReviewsSlider
 * CSS scroll-snap horizontal slider. No new dependency.
 *
 * Features:
 * - scroll-snap-type x mandatory on the track
 * - Responsive slides-per-view via CSS custom props from sliderConfig
 * - Autoplay: pauses on hover, focus-within, tab hidden, reduced-motion
 * - Visible Pause/Play toggle button (WCAG)
 * - Prev / Next buttons + pagination dots
 * - Touch swipe (native scroll-snap), keyboard arrow keys on track
 * - Infinite loop via cloned lead/tail slides (3 clones each end)
 * - No CLS: card height uniform via align-items: stretch + min-height
 */

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useId,
} from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { ReviewCard } from "@/components/home/ReviewCard";
import { cn } from "@/lib/utils";
import type { Review } from "@/data/reviews";
import { sliderConfig } from "@/data/reviews-config";

// How many clones to prepend/append for infinite loop
const CLONE_COUNT = 3;

interface ReviewsSliderProps {
  reviews: Review[];
}

export function ReviewsSlider({ reviews }: ReviewsSliderProps) {
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build cloned array: [...tail, ...reviews, ...head]
  const tail = reviews.slice(-CLONE_COUNT);
  const head = reviews.slice(0, CLONE_COUNT);
  const slides = [...tail, ...reviews, ...head];

  // Real slide count and starting index (after the tail clones)
  const total = reviews.length;
  const [activeIndex, setActiveIndex] = useState(0); // 0-based into reviews[]
  const [isPlaying, setIsPlaying] = useState(!reducedMotion);
  const [isPaused, setIsPaused] = useState(false); // external pause (hover/focus)

  const sliderId = useId();

  // ── Responsive slides-per-view via CSS --reviews-per-view ────────────────────
  // We inject a CSS variable so the track width calculation stays in CSS.
  // The breakpoint logic is purely JS-side (matchMedia mirrors globals.css values).
  const [perView, setPerView] = useState<number>(sliderConfig.slidesPerView.mobile);
  useEffect(() => {
    const mdMq = window.matchMedia("(min-width: 768px)");
    const lgMq = window.matchMedia("(min-width: 1024px)");
    function update() {
      if (lgMq.matches) setPerView(sliderConfig.slidesPerView.desktop);
      else if (mdMq.matches) setPerView(sliderConfig.slidesPerView.tablet);
      else setPerView(sliderConfig.slidesPerView.mobile);
    }
    update();
    mdMq.addEventListener("change", update);
    lgMq.addEventListener("change", update);
    return () => {
      mdMq.removeEventListener("change", update);
      lgMq.removeEventListener("change", update);
    };
  }, []);

  // ── Scroll helpers ────────────────────────────────────────────────────────────
  // The real slide at position `realIdx` (0-based in reviews[]) lives at
  // slides[CLONE_COUNT + realIdx] in the cloned array.
  const getSlideEl = useCallback(
    (clonedIdx: number): HTMLDivElement | null => {
      const track = trackRef.current;
      if (!track) return null;
      return track.children[clonedIdx] as HTMLDivElement;
    },
    []
  );

  const scrollToClonedIdx = useCallback(
    (clonedIdx: number, smooth = true) => {
      const el = getSlideEl(clonedIdx);
      if (!el || !trackRef.current) return;
      const gap = sliderConfig.slideGapRem * 16; // rem → px (assume 16px root)
      const slideW = el.offsetWidth + gap;
      trackRef.current.scrollTo({
        left: slideW * clonedIdx,
        behavior: smooth && !reducedMotion ? "smooth" : "instant",
      });
    },
    [getSlideEl, reducedMotion]
  );

  // Navigate to a real review index (wrapping handled)
  const goTo = useCallback(
    (realIdx: number, smooth = true) => {
      const wrapped = ((realIdx % total) + total) % total;
      setActiveIndex(wrapped);
      scrollToClonedIdx(CLONE_COUNT + wrapped, smooth);
    },
    [total, scrollToClonedIdx]
  );

  // ── Initial scroll position (no animation) ────────────────────────────────────
  useEffect(() => {
    scrollToClonedIdx(CLONE_COUNT, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Infinite loop: jump when scrolling into clones ───────────────────────────
  // Listens to the native scroll event and silently teleports when a clone zone
  // is reached, creating an apparent seamless loop.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function onScrollEnd() {
      if (!track) return;
      const gap = sliderConfig.slideGapRem * 16;
      const slideW = (track.children[0] as HTMLDivElement)?.offsetWidth ?? 0;
      if (!slideW) return;
      const step = slideW + gap;
      const scrollLeft = track.scrollLeft;
      const clonedIdx = Math.round(scrollLeft / step);

      // If scrolled into the prepended tail clones → jump to real equivalents
      if (clonedIdx < CLONE_COUNT) {
        const realEquiv = CLONE_COUNT + total - (CLONE_COUNT - clonedIdx);
        track.scrollTo({ left: realEquiv * step, behavior: "instant" });
        setActiveIndex(((realEquiv - CLONE_COUNT) % total + total) % total);
        return;
      }
      // If scrolled into the appended head clones → jump back to real equivalents
      if (clonedIdx >= CLONE_COUNT + total) {
        const realEquiv = clonedIdx - total;
        track.scrollTo({ left: realEquiv * step, behavior: "instant" });
        setActiveIndex(realEquiv - CLONE_COUNT);
        return;
      }
      // Normal slide: update active dot
      setActiveIndex(clonedIdx - CLONE_COUNT);
    }

    track.addEventListener("scrollend", onScrollEnd);
    // Fallback for browsers without scrollend
    let timeout: ReturnType<typeof setTimeout>;
    function onScroll() {
      clearTimeout(timeout);
      timeout = setTimeout(onScrollEnd, 80);
    }
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scrollend", onScrollEnd);
      track.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    };
  }, [total]);

  // ── Autoplay ──────────────────────────────────────────────────────────────────
  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = null;
  }, []);

  const startAutoplay = useCallback(() => {
    if (reducedMotion || !isPlaying) return;
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % total;
        scrollToClonedIdx(CLONE_COUNT + next, true);
        return next;
      });
    }, sliderConfig.autoplayIntervalMs);
  }, [reducedMotion, isPlaying, total, scrollToClonedIdx, stopAutoplay]);

  // Start/stop based on isPlaying + reducedMotion
  useEffect(() => {
    if (!reducedMotion && isPlaying && !isPaused) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
    return stopAutoplay;
  }, [isPlaying, isPaused, reducedMotion, startAutoplay, stopAutoplay]);

  // Pause when tab is hidden
  useEffect(() => {
    function onVisibility() {
      if (document.hidden) stopAutoplay();
      else if (isPlaying && !isPaused && !reducedMotion) startAutoplay();
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isPlaying, isPaused, reducedMotion, startAutoplay, stopAutoplay]);

  // ── Keyboard navigation on track ─────────────────────────────────────────────
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(activeIndex - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(activeIndex + 1);
    }
  }

  // ── Controls ──────────────────────────────────────────────────────────────────
  const liveRegionId = `${sliderId}-live`;

  return (
    <div
      className="relative"
      onMouseEnter={() => { if (sliderConfig.pauseOnHover) setIsPaused(true); }}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(e) => {
        // Only un-pause if focus left the entire slider container
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsPaused(false);
        }
      }}
    >
      {/* Live region for screen readers */}
      <div
        id={liveRegionId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Review {activeIndex + 1} of {total}
      </div>

      {/* ── Track ──────────────────────────────────────────────────────────── */}
      <div
        ref={trackRef}
        role="region"
        aria-label="Patient Google reviews"
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={cn(
          "flex overflow-x-scroll no-scrollbar",
          "scroll-snap-type-x-mandatory"
        )}
        style={{
          scrollSnapType: "x mandatory",
          scrollBehavior: reducedMotion ? "auto" : "smooth",
          gap: `${sliderConfig.slideGapRem}rem`,
          // Negative side margins + matching padding so edge cards peek through
          marginInline: `calc(-1 * var(--container-px))`,
          paddingInline: `var(--container-px)`,
          // Prevent track from being a focus ring target itself
          outline: "none",
          alignItems: "stretch",
        }}
      >
        {slides.map((review, clonedIdx) => {
          // Determine real index within reviews[] for ARIA
          const isClone =
            clonedIdx < CLONE_COUNT || clonedIdx >= CLONE_COUNT + total;
          return (
            <div
              key={`${review.id}-${clonedIdx}`}
              aria-hidden={isClone ? "true" : undefined}
              style={{
                // Slide width: (100% - gaps) / perView, then minus a peek amount
                flex: `0 0 calc((100% - ${(perView - 1) * sliderConfig.slideGapRem}rem) / ${perView})`,
                scrollSnapAlign: "start",
                minHeight: "var(--review-card-min-h, 220px)",
                display: "flex",
              }}
            >
              <ReviewCard review={review} className="w-full" />
            </div>
          );
        })}
      </div>

      {/* ── Controls row: prev | dots | next | pause ─────────────────────── */}
      <div className="flex items-center justify-center gap-3 mt-6">
        {/* Prev */}
        <button
          type="button"
          aria-label="Previous review"
          onClick={() => goTo(activeIndex - 1)}
          className={cn(
            "btn btn-ghost w-9 h-9 p-0 rounded-full border",
            "flex items-center justify-center shrink-0"
          )}
          style={{ borderColor: "var(--mist)" }}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>

        {/* Dots */}
        <div
          role="tablist"
          aria-label="Select review"
          className="flex items-center gap-1.5 flex-wrap justify-center max-w-[200px]"
        >
          {reviews.map((review, i) => (
            <button
              key={review.id}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Go to review ${i + 1} of ${total} — ${review.reviewerName}`}
              type="button"
              onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              style={{
                width: i === activeIndex ? "20px" : "6px",
                height: "6px",
                background:
                  i === activeIndex ? "var(--primary)" : "var(--mist)",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        {/* Next */}
        <button
          type="button"
          aria-label="Next review"
          onClick={() => goTo(activeIndex + 1)}
          className={cn(
            "btn btn-ghost w-9 h-9 p-0 rounded-full border",
            "flex items-center justify-center shrink-0"
          )}
          style={{ borderColor: "var(--mist)" }}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>

        {/* Pause / Play — hidden under reduced-motion (autoplay already off) */}
        {!reducedMotion && (
          <button
            type="button"
            aria-label={isPlaying ? "Pause auto-advancing reviews" : "Play auto-advancing reviews"}
            aria-pressed={!isPlaying}
            onClick={() => setIsPlaying((p) => !p)}
            className={cn(
              "btn btn-ghost w-9 h-9 p-0 rounded-full border ml-1",
              "flex items-center justify-center shrink-0"
            )}
            style={{ borderColor: "var(--mist)" }}
          >
            {isPlaying ? (
              <Pause size={14} aria-hidden="true" />
            ) : (
              <Play size={14} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
