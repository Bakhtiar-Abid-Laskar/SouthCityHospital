export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface DoctorWeeklySchedule {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "13:00"
  slotDurationMinutes: number; // e.g. 30
  isActive: boolean;
}

export type ExceptionType =
  | "full_day_unavailable"
  | "partial_unavailable"
  | "custom_hours";

export interface DoctorAvailabilityException {
  id: string;
  doctorId: string;
  date: string; // "YYYY-MM-DD"
  type: ExceptionType;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
  createdBy?: string | null;
  createdAt: string;
}

export interface BookableSlot {
  startTime: string; // "09:00"
  endTime: string;   // "09:30"
  label: string;     // "9:00 AM – 9:30 AM"
  isAvailable: boolean;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  dob?: string | null;
  gender?: string | null;
  createdAt: string;
  totalVisits: number;
  lastVisitDate?: string | null;
}

export interface ConsultationSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

export interface DoctorEducation {
  degree: string;
  institution: string;
  year?: string | number;
}

export interface DoctorFAQ {
  question: string;
  answer: string;
}

export interface Doctor {
  id: string;
  name: string;
  departmentSlug: string;
  qualifications: string[];
  experienceYears: number;
  consultationSchedule: ConsultationSchedule[];
  photoUrl: string | null;
  active: boolean;
  biography?: string | null;
  bio?: string | null;
  languages?: string[];
  registrationNumber: string;
  weeklySchedules?: DoctorWeeklySchedule[];
  slug?: string;
  expertise?: string[];
  conditionsTreated?: string[];
  education?: DoctorEducation[];
  faqs?: DoctorFAQ[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  isActive?: boolean;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type DoctorFilterParams = {
  departmentSlug?: string;
  activeOnly?: boolean;
};

/**
 * Generates an authoritative, crawlable SEO doctor slug:
 * Format: dr-<first>-<last>-<specialty>-silchar
 * Lowercase, hyphenated, ASCII only.
 */
export function generateDoctorSlug(
  name: string,
  departmentSlug: string,
  existingSlugs: string[] = []
): string {
  let cleanName = name
    .replace(/^(dr\.|dr|doctor|prof\.|prof)\s+/gi, "")
    .replace(/^(dr\.|dr|doctor|prof\.|prof)\s+/gi, "")
    .trim();

  const nameSlug = cleanName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const specialtySlug = (departmentSlug || "general")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const baseSlug = `dr-${nameSlug}-${specialtySlug}-silchar`;

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
