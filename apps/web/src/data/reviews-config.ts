/**
 * South City Hospital - Google Reviews Slider Configuration
 * All values are token-driven. No hardcoded values in JSX.
 *
 * GOOGLE_MAPS_REVIEWS_URL: The exact URL provided. Never modify or shorten.
 * sliderConfig: All slider behaviour settings consumed by ReviewsSlider.
 */

// Google Maps Reviews URL - exact URL as supplied; do not modify.
export const GOOGLE_MAPS_REVIEWS_URL =
  "https://www.google.com/maps?sca_esv=658d89bb58b2aa3f&biw=1512&bih=771&output=search&q=South+City+Hospital+Silchar&stick=H4sIAAAAAAAAAONgFuLRT9c3NCxKySgozElRQuFpCQZnpqSWJ1YW-6VWlASXpBYU_2IUC0jNL8hJVUjMKc5XKE5NLErOUEjLL1rEKh2cX1qSoeCcWVKp4JFfXJBZkpijEJyZk5yRWHSLTZLhjUNFYC5fU-eScMNDrNqLNkckBdukh30_DgARTSs8hAAAAA&source=lnms&fbs=ABfTbFVyMZGZf1hfvX9uKjN_-G8c4u0nXx4bEIpwm1lnNH832f01nJrJQBh6ZiQ_SpYVjD03UDbHckLqQQtU4j8UX1eWIPfLjGJFT6_QU1CC4sxOdtg28m8bnFgdAiEZK0hkUryqSxw-sLjN51v1VOeNgB4nDiu6EOQdw1geFomBQQ79Efc-FtR9OuQGs4dAYCyv2eUmwv2CORQkFlDMk7k2pHojnJRHIg&entry=mc&ved=1t:200715&ictx=111";

// Slider configuration
export const sliderConfig = {
  /**
   * Autoplay interval in milliseconds.
   * The slider auto-advances this many ms after settling on a slide.
   * Autoplay is fully disabled under prefers-reduced-motion.
   */
  autoplayIntervalMs: 4500,

  /**
   * Whether autoplay pauses when the user hovers over the slider.
   * Also pauses on focus-within and when the browser tab is hidden.
   */
  pauseOnHover: true,

  /**
   * Number of review lines before the card text is clamped.
   * Full text is always in the DOM (aria-accessible); this is purely visual.
   */
  reviewTextClampLines: 4,

  /**
   * Slides visible per breakpoint.
   * Keys match Tailwind v4 breakpoints (globals.css @theme):
   *   mobile  < 768px   (--breakpoint-md)
   *   tablet  768-1023  (--breakpoint-lg)
   *   desktop >= 1024px (--breakpoint-lg)
   */
  slidesPerView: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },

  /**
   * Gap between slides (CSS value consumed by the track).
   * Uses the same gap unit as other card grids (gap-6 = 1.5rem).
   */
  slideGapRem: 1.5,
} as const;

export type SliderConfig = typeof sliderConfig;
