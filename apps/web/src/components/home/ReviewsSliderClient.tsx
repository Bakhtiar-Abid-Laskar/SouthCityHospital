"use client";

import dynamic from "next/dynamic";
import type { Review } from "@/data/reviews";

const ReviewsSlider = dynamic(
  () =>
    import("@/components/home/ReviewsSlider").then((m) => ({
      default: m.ReviewsSlider,
    })),
  { ssr: false }
);

interface ReviewsSliderClientProps {
  reviews: Review[];
}

export function ReviewsSliderClient({ reviews }: ReviewsSliderClientProps) {
  return <ReviewsSlider reviews={reviews} />;
}
