import type {
  Appointment,
  CreateBookingInput,
  LookupBookingParams,
  BookingResponse,
} from "@sch/types";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "sch_appointments_store";

const SEED_APPOINTMENTS: Appointment[] = [];

function getStoredAppointments(): Appointment[] {
  if (typeof window === "undefined") {
    return SEED_APPOINTMENTS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_APPOINTMENTS));
      return SEED_APPOINTMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_APPOINTMENTS;
  }
}

function saveAppointments(appointments: Appointment[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  } catch (err) {
    console.error("Failed to persist appointment", err);
  }
}

function generateBookingReference(existing: Appointment[]): string {
  const year = new Date().getFullYear();
  const prefix = `SCH-${year}-`;
  
  let maxSeq = 45;
  for (const apt of existing) {
    if (apt.bookingReference.startsWith(prefix)) {
      const numPart = parseInt(apt.bookingReference.replace(prefix, ""), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `${prefix}${nextSeq.toString().padStart(5, "0")}`;
}

/**
 * create_booking — Single authority function for creating appointments.
 * Dispatches to Supabase create_booking RPC when configured, or local fallback.
 */
export async function createBooking(input: CreateBookingInput): Promise<BookingResponse> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc("create_booking", {
        p_doctor_id: input.doctorId,
        p_department_slug: input.departmentSlug,
        p_patient_name: input.patientName,
        p_patient_phone: input.patientPhone,
        p_patient_dob: input.patientDob,
        p_preferred_date: input.preferredDate,
        p_preferred_time_slot: input.preferredTimeSlot || null,
        p_message: input.message || null,
      });

      if (!error && data && data.success) {
        // Also cache locally for seamless multi-tab sync
        const existing = getStoredAppointments();
        saveAppointments([data.booking, ...existing]);
        return data as BookingResponse;
      } else if (error) {
        console.warn("Supabase create_booking RPC returned error, using reliable local engine:", error.message);
      }
    } catch (err: any) {
      console.warn("Supabase create_booking failed, using local fallback:", err);
    }
  }

  // Local fallback simulation
  await new Promise((r) => setTimeout(r, 400));

  const todayStr = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 2);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  if (input.preferredDate < todayStr) {
    return {
      success: false,
      error: "Preferred appointment date cannot be in the past.",
    };
  }
  if (input.preferredDate > maxDateStr) {
    return {
      success: false,
      error: "Doctor appointments can only be booked up to 2 days in advance.",
    };
  }

  const cleanPhone = input.patientPhone.trim();
  const cleanName = input.patientName.trim();

  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: "Please enter a valid full name." };
  }
  if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 10) {
    return { success: false, error: "Please enter a valid 10-digit phone number." };
  }
  if (!input.patientDob) {
    return { success: false, error: "Please enter your date of birth." };
  }

  const existing = getStoredAppointments();

  // Part A.6 Uniqueness constraint: prevent double booking exact slot
  if (input.preferredTimeSlot) {
    const isConflict = existing.some(
      (a) =>
        a.doctorId === input.doctorId &&
        a.preferredDate === input.preferredDate &&
        a.preferredTimeSlot === input.preferredTimeSlot &&
        a.status !== "Cancelled"
    );

    if (isConflict) {
      return {
        success: false,
        error: "This time slot was just booked by another patient. Please select another slot.",
      };
    }
  }

  const bookingReference = generateBookingReference(existing);

  const newAppointment: Appointment = {
    id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    bookingReference,
    doctorId: input.doctorId,
    doctorName: input.doctorName,
    departmentSlug: input.departmentSlug,
    departmentName: input.departmentName,
    patientName: cleanName,
    patientPhone: cleanPhone,
    patientDob: input.patientDob,
    preferredDate: input.preferredDate,
    preferredTimeSlot: input.preferredTimeSlot || null,
    message: input.message?.trim() || null,
    status: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newAppointment, ...existing];
  saveAppointments(updated);

  return {
    success: true,
    booking: newAppointment,
  };
}

/**
 * lookup_booking — Search RPC for patient status lookups without login.
 * Dispatches to Supabase lookup_booking RPC when configured, or local fallback.
 */
export async function lookupBooking(params: LookupBookingParams): Promise<BookingResponse> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc("lookup_booking", {
        p_booking_reference: params.bookingReference?.trim() || null,
        p_patient_phone: params.patientPhone?.trim() || null,
        p_patient_dob: params.patientDob || null,
      });

      if (!error && data) {
        return data as BookingResponse;
      }
    } catch (err) {
      console.warn("Supabase lookup_booking failed, using local fallback:", err);
    }
  }

  // Local fallback simulation
  await new Promise((r) => setTimeout(r, 500));

  const all = getStoredAppointments();

  if (params.bookingReference && params.bookingReference.trim()) {
    const queryRef = params.bookingReference.trim().toUpperCase();
    const found = all.filter((a) => a.bookingReference.toUpperCase() === queryRef);
    
    return {
      success: true,
      bookings: found,
    };
  }

  if (params.patientPhone && params.patientDob) {
    const rawQueryPhone = params.patientPhone.replace(/\D/g, "");
    const queryDob = params.patientDob.trim();

    const found = all.filter((a) => {
      const storedPhoneDigits = a.patientPhone.replace(/\D/g, "");
      const matchPhone = storedPhoneDigits.endsWith(rawQueryPhone) || rawQueryPhone.endsWith(storedPhoneDigits);
      const matchDob = a.patientDob === queryDob;
      return matchPhone && matchDob;
    });

    return {
      success: true,
      bookings: found,
    };
  }

  return {
    success: false,
    error: "Please provide either a Booking Reference number or your Phone + Date of Birth.",
  };
}
