import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import type { Doctor } from "@sch/types";
import { generateDoctorSlug } from "@/lib/slugs";

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
      return JSON.parse(raw) || [];
    }
  } catch (err) {
    console.error("Error reading data/doctors.json:", err);
  }
  return [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const departmentSlug = searchParams.get("departmentSlug");
  const activeOnly = searchParams.get("activeOnly") !== "false";

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase.from("doctors").select("*");
      if (departmentSlug && departmentSlug !== "all") {
        query = query.eq("department_slug", departmentSlug);
      }
      if (activeOnly) {
        query = query.eq("active", true);
      }
      const { data, error } = await query;
      if (!error && data) {
        const slugs: string[] = [];
        const mapped: Doctor[] = data.map((d: any) => {
          const slug = d.slug || generateDoctorSlug(d.name, d.department_slug, slugs);
          slugs.push(slug);
          return {
            id: d.id,
            name: d.name,
            departmentSlug: d.department_slug,
            qualifications: d.qualifications || [],
            experienceYears: d.experience_years || 0,
            photoUrl: d.photo_url || null,
            active: d.active ?? true,
            isActive: d.active ?? true,
            isPublished: d.active ?? true,
            consultationSchedule: d.consultation_schedule || [],
            biography: d.biography || null,
            bio: d.biography || null,
            languages: d.languages || ["English", "Bengali", "Hindi"],
            registrationNumber: d.registration_number || "",
            slug,
            expertise: d.expertise || [],
            education: d.education || [],
            faqs: d.faqs || [],
            seoTitle: d.seo_title || null,
            seoDescription: d.seo_description || null,
            updatedAt: d.updated_at || d.created_at || new Date().toISOString(),
          };
        });
        return NextResponse.json({ success: true, doctors: mapped });
      }
    } catch (err) {
      console.warn("Supabase query error in GET /api/doctors:", err);
    }
  }

  let doctors = readLocalDoctors();
  if (departmentSlug && departmentSlug !== "all") {
    doctors = doctors.filter((d) => d.departmentSlug === departmentSlug);
  }
  if (activeOnly) {
    doctors = doctors.filter((d) => d.active);
  }

  return NextResponse.json({ success: true, doctors });
}
