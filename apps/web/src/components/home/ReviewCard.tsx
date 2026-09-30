/**
 * ReviewCard
 * A single Google review card. The entire card is an <a> linking to the
 * Maps URL (opens in new tab). Reviewer initial-avatar uses token colors.
 * Text is visually clamped (line-clamp) but always present in the DOM for
 * screen readers. No hardcoded values - all tokens come from CSS vars or config.
 */

import { StarRating } from "@/components/ui/StarRating";
import { cn } from "@/lib/utils";
import type { Review } from "@/data/reviews";
import { GOOGLE_MAPS_REVIEWS_URL, sliderConfig } from "@/data/reviews-config";

// Deterministic token-palette avatar background per reviewer initial.
// Maps the initial letter to one of four brand-safe CSS var pairs.
function getAvatarStyle(initial: string): { background: string; color: string } {
  const idx = initial.toUpperCase().charCodeAt(0) % 4;
  const palettes = [
    { background: "var(--primary)",      color: "var(--white)" },
    { background: "var(--primary-dark)", color: "var(--white)" },
    { background: "var(--primary-mid)",  color: "var(--white)" },
    { background: "var(--gold-500)",     color: "var(--white)" },
  ] as const;
  return palettes[idx];
}

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const initial = review.reviewerName.charAt(0).toUpperCase();
  const avatarStyle = getAvatarStyle(initial);
  const clampClass = `line-clamp-${sliderConfig.reviewTextClampLines}`;

  return (
    <a
      href={GOOGLE_MAPS_REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      // Accessible name that includes destination context
      aria-label={`${review.reviewerName} - Rated ${review.rating} out of 5. ${review.reviewText} — Read reviews of South City Hospital on Google Maps (opens in a new tab)`}
      className={cn(
        "card flex flex-col gap-4 p-5 sm:p-6 h-full",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-[var(--primary)]",
        "transition-all duration-300",
        className
      )}
      style={{ textDecoration: "none" }}
    >
      {/* Header: avatar + name + stars */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0"
          style={avatarStyle}
          aria-hidden="true"
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p
            className="font-semibold text-sm truncate"
            style={{ color: "var(--ink)" }}
          >
            {review.reviewerName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StarRating rating={review.rating} size={13} />
            <span
              className="text-xs font-medium"
              style={{ color: "var(--slate)" }}
              aria-hidden="true"
            >
              {review.rating.toFixed(1)}
            </span>
          </div>
        </div>
        {/* Google G logo - decorative */}
        <div className="ml-auto shrink-0" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        </div>
      </div>

      {/* Review text - visually clamped, full text in DOM */}
      <p
        className={cn("text-sm leading-relaxed flex-1", clampClass)}
        style={{ color: "var(--slate)" }}
      >
        &ldquo;{review.reviewText}&rdquo;
      </p>

      {/* Footer hint */}
      <p
        className="text-xs mt-auto"
        style={{ color: "var(--mist)" }}
        aria-hidden="true"
      >
        Google Review
      </p>
    </a>
  );
}
