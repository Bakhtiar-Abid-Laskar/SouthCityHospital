/**
 * South City Hospital - Google Reviews Data
 * Source: Google Maps reviews, verbatim.
 * Rules:
 *   - Do NOT edit wording, correct grammar, or reorder by sentiment.
 *   - Do NOT filter negative reviews at any layer.
 *   - Aggregate values (averageRating, totalReviews) are COMPUTED from this
 *     array - never typed by hand.
 *   - For UI display order, use the array order unless a product decision
 *     approves a change.
 */

// Type

/**
 * A single patient Google Review.
 * @property id            - Stable slug derived from reviewer_name (kebab-case)
 * @property reviewerName  - Display name exactly as the reviewer typed it
 * @property rating        - 0.5-5.0 in 0.5 steps
 * @property reviewText    - Verbatim review text; never truncated in the data layer
 */
export interface Review {
  id: string;
  reviewerName: string;
  /** 0.5-5.0 in half-step increments */
  rating: number;
  reviewText: string;
}

// Data

/**
 * All 22 Google reviews, verbatim.
 * Content integrity: wording, spelling, punctuation, and rating values are
 * preserved exactly as supplied. Do not modify.
 */
export const reviews: Review[] = [
  {
    id: "mudit-kothari",
    reviewerName: "Mudit Kothari",
    rating: 5.0,
    reviewText:
      "It is very good hospital genuine rate on medicine also after three days of medicine I am feeling better thanks to South City hospital.",
  },
  {
    id: "shibanjani",
    reviewerName: "Shibanjani",
    rating: 4.5,
    reviewText: "Best hospital with qualified staffs.",
  },
  {
    id: "steven-johnson",
    reviewerName: "Steven Johnson",
    rating: 2.0,
    reviewText:
      "Considering a private hospital it should be more cleaner than it is. The administration department may look into this.",
  },
  {
    id: "debasish",
    reviewerName: "Debasish",
    rating: 1.0,
    reviewText:
      "Not supportive. The reception staff member was unhelpful and did not provide the required information with regards to a new appointment. Terrible experience.",
  },
  {
    id: "kumudini-devi",
    reviewerName: "Kumudini Devi",
    rating: 1.0,
    reviewText:
      "The hospital have receptionist, who is probably challenged with hearing ability. They do not value others time and cancels appointment by their own.",
  },
  {
    id: "amit",
    reviewerName: "Amit",
    rating: 0.5,
    reviewText:
      "If you want a decent hospital, please do not go to this hospital. You will get frustrated as you will run to manage everything right from cleaning...",
  },
  {
    id: "kaidul-islam",
    reviewerName: "Kaidul Islam",
    rating: 1.0,
    reviewText:
      "This is the not responsibility Hospital how many time I will call for reception know anybody reply for engage light almost seven hours.",
  },
  {
    id: "hrishikesh-bhattacharjee",
    reviewerName: "Hrishikesh Bhattacharjee",
    rating: 1.0,
    reviewText:
      "Still not received & respond phone that's lam not availability in the spot, l bound to another Root in to place.",
  },
  {
    id: "kaustav-bhattacharjee",
    reviewerName: "Kaustav Bhattacharjee",
    rating: 1.5,
    reviewText:
      "Accommodation is not good considering it is a private hospital.",
  },
  {
    id: "bishwajit-dey",
    reviewerName: "Bishwajit Dey",
    rating: 5.0,
    reviewText:
      "The experience was smooth and comforting. The environment was welcoming and clean. Top-notch service from start to finish.",
  },
  {
    id: "mridul-mazumder",
    reviewerName: "Mridul Mazumder",
    rating: 5.0,
    reviewText:
      "I appreciated the thorough discussion. No unnecessary tests were recommended. The care provided was excellent.",
  },
  {
    id: "khairul-barbhuiya",
    reviewerName: "Khairul Barbhuiya",
    rating: 5.0,
    reviewText:
      "Superb experience overall, very reassuring experience, friendly environment throughout.",
  },
  {
    id: "gouri-rani-das",
    reviewerName: "Gouri Rani Das",
    rating: 5.0,
    reviewText: "Truly impressive. Highly recommend, service was fast and reliable.",
  },
  {
    id: "loyanganba-khwairakpam",
    reviewerName: "Loyanganba Khwairakpam",
    rating: 5.0,
    reviewText:
      "Service quality was excellent, offered great emotional support, Incredible support from start to finish.",
  },
  {
    id: "rajib-kohar",
    reviewerName: "Rajib Kohar",
    rating: 5.0,
    reviewText:
      "Would recommend without hesitation, ensured every concern was addressed, Very comfortable throughout.",
  },
  {
    id: "pushpa-roy",
    reviewerName: "Pushpa Roy",
    rating: 5.0,
    reviewText:
      "Very happy with the service, treatment was very effective, feel so much better now.",
  },
  {
    id: "sanchita-nath",
    reviewerName: "Sanchita Nath",
    rating: 5.0,
    reviewText:
      "Treatment was spot on, amazing from start to finish. Completely satisfied with the visit.",
  },
  {
    id: "fojiya-begum-laskar",
    reviewerName: "Fojiya Begum Laskar",
    rating: 5.0,
    reviewText:
      "Highly recommended to all. Very welcoming environment, gave personal attention.",
  },
  {
    id: "forid-ahmed-choudhury",
    reviewerName: "Forid Ahmed Choudhury",
    rating: 5.0,
    reviewText:
      "Such excellent service. Everything went very smoothly, offered honest advice.",
  },
  {
    id: "mukesh-deb",
    reviewerName: "Mukesh Deb",
    rating: 5.0,
    reviewText:
      "Very impressed with the service, so much care and attention, prioritized my comfort and safety.",
  },
  {
    id: "rubi-paul",
    reviewerName: "Rubi Paul",
    rating: 5.0,
    reviewText:
      "The overall experience exceeded my expectations. I'll definitely be returning for my future healthcare.",
  },
  {
    id: "mita-shyam",
    reviewerName: "Mita Shyam",
    rating: 5.0,
    reviewText:
      "VERY GOOD SERVICE, OVERALL EXPERIENCE WAS GOOD, DOCTOR EXPLAINED WELL TOTALLY SATISFIED.",
  },
];

// Computed Aggregate (never typed by hand)

/** Total number of reviews - computed from the data array. */
export const totalReviews: number = reviews.length;

/**
 * Average rating across all reviews, rounded to 1 decimal place.
 * Computed at module load; update the reviews array to change this value.
 */
export const averageRating: number = parseFloat(
  (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
);
