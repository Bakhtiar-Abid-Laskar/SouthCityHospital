/**
 * site-url.ts
 * ============
 * Single source of truth for the public website URL in the Admin portal.
 *
 * Rules:
 *  - Reads from NEXT_PUBLIC_SITE_URL (inlined at build time for client components).
 *  - Strips trailing slashes and normalises the origin.
 *  - In production (NODE_ENV === "production") it always returns the live domain
 *    and logs a loud warning if the env var is missing (never falls back to localhost).
 *  - In development the fallback is http://localhost:3000 so local previews work.
 *
 * IMPORTANT: NEXT_PUBLIC_* values are inlined at build time.
 * After changing NEXT_PUBLIC_SITE_URL you MUST trigger a rebuild / redeploy.
 */

const PRODUCTION_DOMAIN = "https://southcityhospital.in";

function resolvePublicSiteUrl(): string {
  // process.env.NEXT_PUBLIC_SITE_URL is replaced by Next.js at build time.
  const envValue =
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.NEXT_PUBLIC_SITE_URL;

  if (envValue) {
    // Normalise: strip trailing slash, ensure no accidental spaces
    return envValue.trim().replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    // Missing in production: log a loud error and use the known live domain
    // so the UI never shows localhost links — but the ops team is alerted.
    console.error(
      "[site-url] ⚠️  NEXT_PUBLIC_SITE_URL is not set in the production " +
        "build environment. Falling back to the hardcoded production domain. " +
        "Set NEXT_PUBLIC_SITE_URL=https://southcityhospital.in in your Vercel " +
        "/ hosting environment variables and REDEPLOY."
    );
    return PRODUCTION_DOMAIN;
  }

  // Development: allow localhost so engineers can preview doctor profiles locally.
  return "http://localhost:3000";
}

/** The canonical public-site origin, e.g. "https://southcityhospital.in" */
export const PUBLIC_SITE_URL = resolvePublicSiteUrl();

/**
 * Returns the full public URL for a given doctor slug.
 *
 * @param slug  - The doctor's URL slug (e.g. "dr-alaka-banerjee-gynecology-and-obst-silchar")
 * @param active - Pass `false` to indicate the doctor is inactive; returns `null`
 *                 so callers can disable/hide the link instead of showing a dead URL.
 *
 * @example
 *   getDoctorProfileUrl("dr-john-doe-cardiology-silchar")
 *   // → "https://southcityhospital.in/doctors/dr-john-doe-cardiology-silchar"
 */
export function getDoctorProfileUrl(
  slug: string | null | undefined,
  active = true
): string | null {
  if (!slug || !active) return null;
  // Encode the slug for safety (handles any future special chars)
  const safePath = encodeURIComponent(slug).replace(/%2F/g, "/");
  return `${PUBLIC_SITE_URL}/doctors/${safePath}`;
}
