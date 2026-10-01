import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/session";
import type { Doctor } from "@sch/types";
import { generateDoctorSlug } from "@sch/types";

const DATA_FILE = path.resolve(process.cwd(), "..", "..", "data", "doctors.json");
const LLMS_FILE = path.resolve(process.cwd(), "..", "web", "public", "llms.txt");

function syncPublicLlmsTxt(doctors: any[]) {
  try {
    const activeDocs = doctors.filter((d) => d.active !== false);
    let doctorMarkdown = "";
    activeDocs.forEach((doc, idx) => {
      const cleanName = (doc.name || "").replace(/\s+/g, " ").trim();
      const displayName = cleanName.startsWith("Dr.") ? cleanName : `Dr. ${cleanName}`;
      const qualStr =
        doc.qualifications && doc.qualifications.length > 0
          ? doc.qualifications.join(", ")
          : "Consultant Physician";
      const expStr =
        doc.experienceYears > 0 ? `${doc.experienceYears}+ Years` : "Experienced Consultant";
      const regStr = doc.registrationNumber
        ? `\n   - Medical Registration No: ${doc.registrationNumber}`
        : "";
      const scheduleStr =
        doc.consultationSchedule && doc.consultationSchedule.length > 0
          ? doc.consultationSchedule
              .map(
                (s: any) =>
                  `${s.day} (${s.startTime || "09:00"} – ${s.endTime || "13:00"})`
              )
              .join(", ")
          : "Monday – Saturday (Hospital OPD Hours)";
      const expertiseStr =
        doc.expertise && doc.expertise.length > 0
          ? `\n   - Clinical Focus: ${doc.expertise.join(", ")}`
          : "";

      doctorMarkdown += `${idx + 1}. **${displayName}** (${doc.departmentSlug || "Specialist"})
   - Qualifications: ${qualStr}
   - Clinical Experience: ${expStr}${regStr}
   - OPD Schedule: ${scheduleStr}${expertiseStr}
   - Profile URL: https://southcityhospital.in/doctors/${doc.slug}\n\n`;
    });

    const content = `# South City Hospital, Silchar — Public Information for LLM & AI Search Agents

> South City Hospital is a premier multi-specialty healthcare institution in Meherpur, Silchar, Assam, serving the Barak Valley region (Cachar, Hailakandi, Karimganj) since 2006. This file provides authoritative context for generative AI search engines, language models, and agentic workflows.

## Hospital Overview
- **Name:** South City Hospital
- **Legal Entity:** South City Hospital, Silchar
- **Tagline:** We care with a difference
- **Established:** 2006
- **Managing Partner:** Nilava Mazumder
- **Location:** Meherpur, Silchar, Assam – 788015, India
- **Coordinates:** 24.785576° N, 92.7955732° E
- **Google Maps:** https://www.google.com/maps/place/South+City+Hospital/@24.785576,92.7955732,17z
- **Official Website:** https://southcityhospital.in
- **Wikidata Geographic Grounding:**
  - Silchar: https://www.wikidata.org/wiki/Q1025556
  - Cachar: https://www.wikidata.org/wiki/Q42777
  - Barak Valley: https://www.wikidata.org/wiki/Q2605553
  - Assam: https://www.wikidata.org/wiki/Q1198

## Emergency & 24/7 Critical Response
- **24/7 Emergency & Trauma Hotline:** +91 6901271223 (Immediate medical response in Silchar)
- **24/7 Ambulance Dispatch:** +91 6901271223
- **General Hospital Reception:** +91 6901271223
- **General Email:** southcityhospital2014@gmail.com
- **Operating Hours:** Open 24 Hours / 7 Days a week for emergencies, critical care, pharmacy, and diagnostic services.

## Specialist Doctor Directory (Authoritative URLs & OPD Timings)
Patients and AI agents can query and cite individual specialist profiles directly:

${doctorMarkdown.trim()}

## Clinical Departments (13 Specialties)
1. **Orthopaedics & Trauma:** https://southcityhospital.in/departments/orthopaedic-surgery
2. **Urology & Laser Surgery:** https://southcityhospital.in/departments/urology-laser-surgery
3. **Internal Medicine:** https://southcityhospital.in/departments/internal-medicine
4. **Interventional Cardiology:** https://southcityhospital.in/departments/cardiology
5. **Gynecology & Obstetrics:** https://southcityhospital.in/departments/gynecology-and-obst
6. **Neuro Surgery:** https://southcityhospital.in/departments/neuro-surgery
7. **Paediatrics & Neonatology:** https://southcityhospital.in/departments/paediatrics-neonatology
8. **Nephrology & Dialysis:** https://southcityhospital.in/departments/nephrology
9. **Gastroenterology:** https://southcityhospital.in/departments/gastroenterology
10. **ENT (Otorhinolaryngology):** https://southcityhospital.in/departments/ent
11. **General & Laparoscopic Surgery:** https://southcityhospital.in/departments/general-surgery
12. **Dermatology:** https://southcityhospital.in/departments/dermatology
13. **Medical Oncology & Palliative Care:** https://southcityhospital.in/departments/oncology

## Diagnostic & Critical Care Facilities
- Multi-Slice CT-Scan
- Intensive Care Unit (ICU) & Coronary Care Unit (CCU)
- Dedicated Hemodialysis Unit
- High-Frequency Digital X-Ray & Color Doppler USG
- Upper GI Endoscopy & Colonoscopy Suite
- 24/7 Automated Clinical Pathology Laboratory
- Laminar Flow Operation Theaters
- 24/7 In-House Hospital Pharmacy
- 24/7 Advanced Life Support Ambulance Fleet

## Patient Appointment Booking Flow
- **Direct Online Booking:** https://southcityhospital.in/doctors
- **No Login Required:** Patients book with Name, Phone, Date of Birth, and desired OPD slot.
- **Payment Policy:** No advance fee online; consultation fees are settled at hospital registration upon arrival.
- **Confirmation Reference:** Instant reference ID (\`SCH-YYYY-XXXXX\`) generated with a downloadable PDF appointment slip.

## Comprehensive LLM Knowledge Base
- Full in-depth context file: https://southcityhospital.in/llms-full.txt
`;

    if (fs.existsSync(path.dirname(LLMS_FILE))) {
      fs.writeFileSync(LLMS_FILE, content, "utf-8");
    }
  } catch (err) {
    console.warn("Could not sync public/llms.txt:", err);
  }
}

function getAnonSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your-project-ref") || url.includes("your-project-id")) {
    return null;
  }
  return createClient(url, key);
}

function getServiceSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your-project-ref") || url.includes("your-project-id")) {
    return null;
  }
  return createClient(url, key);
}

function syncDoctorToLocalJson(doctor: Doctor) {
  try {
    let list: any[] = [];
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      list = JSON.parse(raw) || [];
    }
    const idx = list.findIndex((d) => d.id === doctor.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...doctor };
    } else {
      list.unshift(doctor);
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
    syncPublicLlmsTxt(list);
  } catch (err) {
    console.warn("Could not sync doctor to data/doctors.json backup:", err);
  }
}

function syncRemoveDoctorFromLocalJson(id: string, removeAll = false) {
  try {
    if (removeAll) {
      fs.writeFileSync(DATA_FILE, "[]", "utf-8");
      syncPublicLlmsTxt([]);
      return;
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      let list: any[] = JSON.parse(raw) || [];
      list = list.filter((d) => d.id !== id);
      fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
      syncPublicLlmsTxt(list);
    }
  } catch (err) {
    console.warn("Could not remove doctor from data/doctors.json backup:", err);
  }
}

async function triggerWebRevalidation(payload: {
  tag?: string;
  path?: string;
  slug?: string;
  departmentSlug?: string;
}) {
  try {
    const webUrl =
      process.env.WEB_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const token =
      process.env.REVALIDATION_SECRET_TOKEN || "sch_revalidation_secret_2026_silchar";

    const res = await fetch(`${webUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn("Web cache revalidation responded with status:", res.status);
    }
  } catch (err) {
    console.warn("Could not dispatch web cache revalidation:", err);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const departmentSlug = searchParams.get("departmentSlug");
  const activeOnly = searchParams.get("activeOnly") === "true";

  const supabase = getAnonSupabaseClient();
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
        const mapped: Doctor[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          departmentSlug: d.department_slug,
          qualifications: d.qualifications || [],
          experienceYears: d.experience_years || 0,
          photoUrl: d.photo_url || null,
          active: d.active ?? true,
          consultationSchedule: d.consultation_schedule || [],
          biography: d.biography || null,
          bio: d.biography || null,
          languages: d.languages || ["English", "Bengali", "Hindi"],
          registrationNumber: d.registration_number || "PENDING",
          slug: d.slug || null,
          expertise: d.expertise || [],
          education: d.education || [],
          faqs: d.faqs || [],
          seoTitle: d.seo_title || null,
          seoDescription: d.seo_description || null,
          updatedAt: d.updated_at || d.created_at,
        }));
        return NextResponse.json({ success: true, doctors: mapped });
      }
    } catch (err) {
      console.warn("Supabase query error in GET /api/doctors:", err);
    }
  }

  return NextResponse.json(
    { success: false, error: "Database client unavailable" },
    { status: 500 }
  );
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const doctor: Doctor = body.doctor;

    if (!doctor || !doctor.id || !doctor.name || !doctor.departmentSlug || !doctor.registrationNumber) {
      return NextResponse.json(
        { success: false, error: "Missing required doctor fields (including registration number)." },
        { status: 400 }
      );
    }

    // 1. Sync to Supabase if configured
    const supabase = getServiceSupabaseClient();
    if (supabase) {
      try {
        // Retain existing slug if already published, or generate if missing
        let doctorSlug = doctor.slug;
        if (!doctorSlug) {
          const { data: existing } = await supabase
            .from("doctors")
            .select("slug")
            .eq("id", doctor.id)
            .maybeSingle();

          if (existing?.slug) {
            doctorSlug = existing.slug;
          } else {
            const { data: allDocs } = await supabase.from("doctors").select("slug");
            const existingSlugs = (allDocs || []).map((d: any) => d.slug).filter(Boolean);
            doctorSlug = generateDoctorSlug(doctor.name, doctor.departmentSlug, existingSlugs);
          }
        }

        const payload: any = {
          id: doctor.id,
          name: doctor.name,
          department_slug: doctor.departmentSlug,
          qualifications: doctor.qualifications,
          experience_years: doctor.experienceYears,
          photo_url: doctor.photoUrl,
          active: doctor.active,
          consultation_schedule: doctor.consultationSchedule,
          languages: doctor.languages || ["English", "Bengali", "Hindi"],
          registration_number: doctor.registrationNumber,
          biography: doctor.biography || doctor.bio || null,
        };

        if (doctorSlug) {
          payload.slug = doctorSlug;
        }
        if (doctor.expertise && Array.isArray(doctor.expertise)) {
          payload.expertise = doctor.expertise;
        }
        if (doctor.education && Array.isArray(doctor.education)) {
          payload.education = doctor.education;
        }
        if (doctor.faqs && Array.isArray(doctor.faqs)) {
          payload.faqs = doctor.faqs;
        }
        if (doctor.seoTitle) {
          payload.seo_title = doctor.seoTitle;
        }
        if (doctor.seoDescription) {
          payload.seo_description = doctor.seoDescription;
        }

        const { error } = await supabase.from("doctors").upsert(payload);

        if (error) {
          console.warn("Supabase upsert error:", error);
          if (error.message?.includes("slug")) {
            delete payload.slug;
            delete payload.expertise;
            delete payload.education;
            delete payload.faqs;
            delete payload.seo_title;
            delete payload.seo_description;
            await supabase.from("doctors").upsert(payload);
          } else {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
          }
        }

        const completeDoc: Doctor = {
          ...doctor,
          slug: doctorSlug,
        };

        // 2. Automatically sync to local data/doctors.json backup
        syncDoctorToLocalJson(completeDoc);

        // 3. Immediately revalidate web cache
        triggerWebRevalidation({
          tag: "doctors",
          path: "/doctors",
          slug: doctorSlug,
          departmentSlug: doctor.departmentSlug,
        });

        return NextResponse.json({ success: true, doctor: completeDoc });
      } catch (err: any) {
        console.warn("Exception in POST /api/doctors:", err);
        return NextResponse.json({ success: false, error: "Failed to upsert doctor." }, { status: 500 });
      }
    }

    return NextResponse.json(
      { success: false, error: "Database client unavailable" },
      { status: 500 }
    );
  } catch (err: any) {
    if (err.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin role required." },
        { status: 403 }
      );
    }
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin session required." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save doctor." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const purgeAll = searchParams.get("all") === "true";

    const supabase = getServiceSupabaseClient();

    if (purgeAll) {
      if (supabase) {
        try {
          const { error } = await supabase.from("doctors").delete().neq("id", "");
          if (error) {
            console.warn("Supabase purge error:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
          }
        } catch (err) {
          console.warn("Exception during purge:", err);
        }
      }
      syncRemoveDoctorFromLocalJson("", true);
      triggerWebRevalidation({ tag: "doctors", path: "/doctors" });
      return NextResponse.json({ success: true, message: "All doctors deleted." });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing doctor ID" }, { status: 400 });
    }

    if (supabase) {
      try {
        const { error } = await supabase.from("doctors").delete().eq("id", id);
        if (error) {
          console.warn("Supabase delete error:", error);
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
      } catch (err) {
        console.warn("Exception during delete:", err);
      }
    }

    syncRemoveDoctorFromLocalJson(id);
    triggerWebRevalidation({ tag: "doctors", path: "/doctors" });

    return NextResponse.json({ success: true, message: `Doctor ${id} deleted.` });
  } catch (err: any) {
    if (err.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin role required." },
        { status: 403 }
      );
    }
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin session required." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete doctor." },
      { status: 500 }
    );
  }
}
