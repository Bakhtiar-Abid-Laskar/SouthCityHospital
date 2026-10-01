"use client";

import { useState, useEffect } from "react";
import type { Doctor, DoctorFilterParams } from "@sch/types";

export async function fetchDoctors(params?: DoctorFilterParams): Promise<Doctor[]> {
  try {
    const fallbackOrigin = process.env.NEXT_PUBLIC_ADMIN_URL || "https://internaladmin.southcityhospital.in";
    const url = new URL("/api/doctors", typeof window !== "undefined" ? window.location.origin : fallbackOrigin);
    if (params?.departmentSlug && params.departmentSlug !== "all") {
      url.searchParams.set("departmentSlug", params.departmentSlug);
    }
    if (params?.activeOnly) {
      url.searchParams.set("activeOnly", "true");
    }

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.doctors)) {
        return json.doctors;
      }
    }
  } catch (err) {
    console.error("fetchDoctors error:", err);
  }
  return [];
}

export async function saveDoctor(doctor: Doctor): Promise<void> {
  try {
    const res = await fetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctor }),
    });
    if (!res.ok) {
      const errJson = await res.json();
      throw new Error(errJson.error || "Failed to save doctor to database");
    }
  } catch (err) {
    console.error("saveDoctor error:", err);
    throw err;
  }
}

export async function deleteDoctor(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/doctors?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errJson = await res.json();
      throw new Error(errJson.error || "Failed to delete doctor from database");
    }
  } catch (err) {
    console.error("deleteDoctor error:", err);
    throw err;
  }
}

export async function clearAllDoctors(): Promise<void> {
  try {
    await fetch("/api/doctors?all=true", { method: "DELETE" });
  } catch (err) {
    console.error("clearAllDoctors error:", err);
  }
}

export function useDoctors(params?: DoctorFilterParams) {
  const [data, setData] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const refresh = () => {
    setIsLoading(true);
    fetchDoctors(params)
      .then((docs) => {
        setData(docs);
        setIsError(false);
      })
      .catch(() => {
        setIsError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    refresh();
  }, [params?.departmentSlug, params?.activeOnly]);

  return { data, isLoading, isError, refresh };
}
