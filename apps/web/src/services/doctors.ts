/**
 * Doctor data-fetching service
 *
 * Fetches exclusively from Supabase `doctors` database table and `/api/doctors` endpoint.
 * Zero hardcoded doctors.
 */

import { useQuery } from "@tanstack/react-query";
import type { Doctor, DoctorFilterParams } from "@sch/types";

async function fetchDoctors(params: DoctorFilterParams = {}): Promise<Doctor[]> {

  // 2. Fetch from backend API /api/doctors
  try {
    const url = new URL("/api/doctors", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    if (params.departmentSlug) url.searchParams.set("departmentSlug", params.departmentSlug);
    if (params.activeOnly !== undefined) url.searchParams.set("activeOnly", String(params.activeOnly));

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.doctors)) {
        return json.doctors;
      }
    }
  } catch (err) {
    console.error("Failed to fetch doctors from /api/doctors:", err);
  }

  return [];
}

// ─── Public Service API ───────────────────────────────────────────────────────

export async function getDoctors(params: DoctorFilterParams = {}): Promise<Doctor[]> {
  return fetchDoctors(params);
}

// ─── React Query Hook ─────────────────────────────────────────────────────────

export function useDoctors(
  params: DoctorFilterParams = {},
  options?: { initialData?: Doctor[] }
) {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: () => fetchDoctors(params),
    initialData: options?.initialData,
    staleTime: 1000 * 5, // 5 seconds
    refetchOnWindowFocus: true,
  });
}
