/**
 * Generates an authoritative, crawlable SEO doctor slug:
 * Format: dr-<first>-<last>-<specialty>-silchar
 * Lowercase, hyphenated, ASCII only.
 *
 * Example:
 *   "Dr. Annesha Roy", "orthopaedic-surgery" -> "dr-annesha-roy-orthopaedic-surgery-silchar"
 */
export function generateDoctorSlug(
  name: string,
  departmentSlug: string,
  existingSlugs: string[] = []
): string {
  // 1. Clean name: remove repeated titles ("Dr.", "Dr", "Doctor", "Prof.", etc.)
  let cleanName = name
    .replace(/^(dr\.|dr|doctor|prof\.|prof)\s+/gi, "")
    .replace(/^(dr\.|dr|doctor|prof\.|prof)\s+/gi, "") // handle "Dr. Dr " cases
    .trim();

  // 2. Transliterate / sanitize to ASCII lowercase
  const nameSlug = cleanName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // 3. Sanitize specialty / department slug
  const specialtySlug = departmentSlug
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // 4. Construct canonical base slug
  const baseSlug = `dr-${nameSlug}-${specialtySlug}-silchar`;

  // 5. Handle collisions / duplicates (-2, -3, etc.)
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  while (existingSlugs.includes(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

/**
 * Validates whether a registration number is legitimate medical registration data.
 * Filters out placeholder values like "nil", "none", "pending", "n/a", etc.
 */
export function isValidRegistrationNumber(reg: string | null | undefined): boolean {
  if (!reg) return false;
  const trimmed = reg.trim().toLowerCase();
  const invalidValues = ["nil", "null", "none", "pending", "n/a", "na", "0", "-", "--"];
  if (invalidValues.includes(trimmed)) return false;
  return trimmed.length >= 2;
}
