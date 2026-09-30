/**
 * ReviewsSection
 * Homepage section: "Patient Reviews" (position 8 of 9).
 * Background: var(--white) - alternates correctly after TestimonialsHighlight
 * which uses var(--primary-light).
 *
 * Static content is server-rendered (this is NOT a "use client" file).
 * ReviewsSlider is the only client component and is imported dynamically.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ScrollReveal } from "@/components/ui/motion";
import { StarRating } from "@/components/ui/StarRating";
import { reviews, averageRating, totalReviews } from "@/data/reviews";
import { GOOGLE_MAPS_REVIEWS_URL } from "@/data/reviews-config";

// Client-only slider - no SSR needed; does not affect hero or section layout
const ReviewsSlider = dynamic(
  () =>
    import("@/components/home/ReviewsSlider").then((m) => ({
      default: m.ReviewsSlider,
    })),
  { ssr: false }
);

export function ReviewsSection() {
  return (
    <section
      id="patient-reviews"
      aria-labelledby="reviews-heading"
      className="py-[var(--section-y)] overflow-hidden"
      style={{ background: "var(--white)" }}
    >
      <div className="container-site">
        {/* ── Section header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <ScrollReveal>
            <p className="eyebrow mb-3">Patient Reviews</p>
            <h2
              id="reviews-heading"
              className="font-display text-display-lg"
              style={{ color: "var(--primary-dark)" }}
            >
              What our community
              <br />
              says about us.
            </h2>

            {/* Aggregate rating badge */}
            <div className="flex items-center gap-3 mt-4">
              <StarRating rating={averageRating} size={20} />
              <span
                className="font-semibold text-base"
                style={{ color: "var(--ink)" }}
              >
                {averageRating} average
              </span>
              <span
                className="text-sm"
                style={{ color: "var(--slate)" }}
              >
                from {totalReviews} reviews
              </span>
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal delay={0.1}>
            <Link
              href={GOOGLE_MAPS_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline gap-2 whitespace-nowrap self-start"
              aria-label="See all reviews of South City Hospital on Google Maps (opens in a new tab)"
            >
              See all on Google
              <ExternalLink size={14} aria-hidden="true" />
            </Link>
          </ScrollReveal>
        </div>

        {/* ── Slider ──────────────────────────────────────────────────────── */}
        <ReviewsSlider reviews={reviews} />
      </div>
    </section>
  );
}
