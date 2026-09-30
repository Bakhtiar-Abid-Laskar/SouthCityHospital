/**
 * StarRating
 * Renders a 0.5-step star rating (0.5-5.0) using inline SVG.
 * Accessibility: decorative SVGs are aria-hidden; a visually-hidden span
 * carries the accessible label ("Rated X out of 5 stars").
 * No hardcoded colors - all fill values reference CSS custom properties.
 */

import { cn } from "@/lib/utils";

// Each star can be full, half, or empty.
type StarState = "full" | "half" | "empty";

function getStarStates(rating: number): StarState[] {
  // Clamp to [0, 5] in 0.5 steps
  const clamped = Math.max(0, Math.min(5, Math.round(rating * 2) / 2));
  return Array.from({ length: 5 }, (_, i) => {
    const threshold = i + 1;
    if (clamped >= threshold) return "full";
    if (clamped >= threshold - 0.5) return "half";
    return "empty";
  });
}

interface StarIconProps {
  state: StarState;
  index: number;
  size?: number;
}

function StarIcon({ state, index, size = 16 }: StarIconProps) {
  // Unique clip-path ID per star to allow safe half-fill on the same page
  const clipId = `star-half-${index}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {state === "half" && (
        <defs>
          <clipPath id={clipId}>
            {/* Left half only */}
            <rect x="0" y="0" width="8" height="16" />
          </clipPath>
        </defs>
      )}

      {/* Empty star background */}
      <path
        d="M8 1l1.797 3.64 4.017.584-2.907 2.832.686 3.997L8 10.25l-3.593 1.803.686-3.997L2.186 5.224l4.017-.584L8 1z"
        fill="var(--mist)"
      />

      {/* Filled overlay: full or half via clip-path */}
      {state !== "empty" && (
        <path
          d="M8 1l1.797 3.64 4.017.584-2.907 2.832.686 3.997L8 10.25l-3.593 1.803.686-3.997L2.186 5.224l4.017-.584L8 1z"
          fill="var(--gold-500)"
          clipPath={state === "half" ? `url(#${clipId})` : undefined}
        />
      )}
    </svg>
  );
}

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
}

/**
 * Renders 5 stars for the given rating (0.5-step resolution).
 * Includes a visually-hidden accessible label.
 */
export function StarRating({ rating, size = 16, className }: StarRatingProps) {
  const states = getStarStates(rating);
  const label = `Rated ${rating} out of 5 stars`;

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={label}
    >
      {states.map((state, i) => (
        <StarIcon key={i} state={state} index={i} size={size} />
      ))}
    </span>
  );
}
