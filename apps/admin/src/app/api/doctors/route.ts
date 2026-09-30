import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/session";
import type { Doctor } from "@sch/types";
import { generateDoctorSlug } from "@sch/types";

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
          languages: d.languages || ["English", "Bengali", "Hindi"],
          registrationNumber: d.registration_number || "PENDING",
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
        if (doctor.expertise && doctor.expertise.length > 0) {
          payload.expertise = doctor.expertise;
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
          // If error is about missing 'slug' column in un-migrated DB, retry without slug
          if (error.message?.includes("slug")) {
            delete payload.slug;
            delete payload.expertise;
            delete payload.seo_title;
            delete payload.seo_description;
            await supabase.from("doctors").upsert(payload);
          } else {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
          }
        }

      } catch (err) {
        console.warn("Exception in POST /api/doctors:", err);
        return NextResponse.json({ success: false, error: "Failed to upsert doctor." }, { status: 500 });
      }
      return NextResponse.json({ success: true, doctor });
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
