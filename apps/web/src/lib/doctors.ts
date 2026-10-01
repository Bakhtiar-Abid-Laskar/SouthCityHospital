import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import type { Doctor } from "@sch/types";
import { generateDoctorSlug, isValidRegistrationNumber } from "@/lib/slugs";

const DATA_FILE = path.join(process.cwd(), "..", "..", "data", "doctors.json");

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your-project-ref") || url.includes("your-project-id")) {
    return null;
  }
  return createClient(url, key);
}

function readLocalDoctors(): Doctor[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        return list;
      }
    }
  } catch (err) {
    console.warn("Could not read fallback data/doctors.json:", err);
  }
  return [];
}

/**
 * Normalizes raw doctor database/json records into the strongly-typed Doctor model.
 */
function normalizeDoctor(d: any, existingSlugs: string[] = []): Doctor {
  const departmentSlug = d.department_slug || d.departmentSlug || "general";
  const name = d.name || "Doctor";
  const slug = d.slug || generateDoctorSlug(name, departmentSlug, existingSlugs);

  return {
    id: d.id,
    name,
    departmentSlug,
    qualifications: Array.isArray(d.qualifications) ? d.qualifications : (d.qualifications ? [d.qualifications] : []),
    experienceYears: typeof d.experience_years === "number" ? d.experience_years : (d.experienceYears || 0),
    consultationSchedule: Array.isArray(d.consultation_schedule) ? d.consultation_schedule : (d.consultationSchedule || []),
    photoUrl: d.photo_url || d.photoUrl || null,
    active: d.active ?? true,
    isActive: d.active ?? true,
    isPublished: d.active ?? true,
    biography: d.biography || d.bio || null,
    bio: d.biography || d.bio || null,
    languages: Array.isArray(d.languages) && d.languages.length > 0 ? d.languages : ["English", "Bengali", "Hindi"],
    registrationNumber: d.registration_number || d.registrationNumber || "",
    slug,
    expertise: Array.isArray(d.expertise) ? d.expertise : [],
    education: Array.isArray(d.education) ? d.education : [],
    faqs: Array.isArray(d.faqs) ? d.faqs : [],
    seoTitle: d.seo_title || d.seoTitle || null,
    seoDescription: d.seo_description || d.seoDescription || null,
    createdAt: d.created_at || d.createdAt,
    updatedAt: d.updated_at || d.updatedAt || new Date().toISOString(),
  };
}

/**
 * Raw fetcher that hits Supabase directly on the server, with local json fallback.
 */
async function fetchAllDoctorsRaw(): Promise<Doctor[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .order("name", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const slugs: string[] = [];
        return data.map((item) => {
          const doc = normalizeDoctor(item, slugs);
          slugs.push(doc.slug!);
          return doc;
        });
      }
      if (error) {
        console.warn("Supabase doctor query returned error, falling back to local:", error.message);
      }
    } catch (err) {
      console.warn("Failed fetching doctors from Supabase:", err);
    }
  }

  // Fallback to local data file
  const local = readLocalDoctors();
  const slugs: string[] = [];
  return local.map((item) => {
    const doc = normalizeDoctor(item, slugs);
    slugs.push(doc.slug!);
    return doc;
  });
}

/**
 * Returns all active, published doctors.
 * Cached on the server with Next.js unstable_cache (1 hour TTL, tagged with 'doctors').
 */
export const getAllPublishedDoctors = unstable_cache(
  async (): Promise<Doctor[]> => {
    const all = await fetchAllDoctorsRaw();
    return all.filter((doc) => doc.active !== false);
  },
  ["all-published-doctors"],
  {
    revalidate: 3600,
    tags: ["doctors"],
  }
);

/**
 * Returns an individual published doctor by their unique SEO slug.
 */
export async function getDoctorBySlug(slug: string): Promise<Doctor | null> {
  const doctors = await getAllPublishedDoctors();
  const normalizedSlug = slug.toLowerCase().trim();
  const found = doctors.find((d) => d.slug?.toLowerCase() === normalizedSlug);
  return found || null;
}

/**
 * Returns all published doctors belonging to a specific clinical department.
 */
export async function getDoctorsByDepartment(departmentSlug: string): Promise<Doctor[]> {
  const doctors = await getAllPublishedDoctors();
  return doctors.filter((d) => d.departmentSlug === departmentSlug);
}

/**
 * Returns up to `limit` related doctors in the same department (excluding the current doctor).
 */
export async function getRelatedDoctors(doctor: Doctor, limit = 3): Promise<Doctor[]> {
  const departmentDoctors = await getDoctorsByDepartment(doctor.departmentSlug);
  const peers = departmentDoctors.filter((d) => d.id !== doctor.id);
  return peers.slice(0, limit);
}

/**
 * Generates an authoritative, natural, high-trust biography paragraph
 * when a custom doctor bio is not yet entered in the database.
 */
export function getDoctorFallbackBio(doctor: Doctor, departmentName: string): string {
  const expText = doctor.experienceYears > 0 ? `with over ${doctor.experienceYears} years of dedicated clinical experience` : "with extensive clinical training";
  const qualsText = doctor.qualifications.length > 0 ? `holds qualifications in ${doctor.qualifications.join(", ")} and` : "";
  
  return `Dr. ${doctor.name.replace(/^dr\.?\s+/i, "")} is a respected medical specialist serving in the ${departmentName} department at South City Hospital in Meherpur, Silchar. Dr. ${doctor.name.replace(/^dr\.?\s+/i, "")} ${qualsText} ${expText}, providing comprehensive diagnostic evaluations and evidence-based clinical consultations for patients and families across Silchar, Cachar, and the wider Barak Valley region of Assam.`;
}

export { isValidRegistrationNumber };
