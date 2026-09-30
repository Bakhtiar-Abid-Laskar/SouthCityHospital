"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  User,
  Phone,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Ban,
} from "lucide-react";
import Image from "next/image";
import type { Doctor, Appointment, BookableSlot } from "@sch/types";
import { departments } from "@/data/departments";
import { createBooking } from "@/services/appointments";
import { fetchDoctorAvailabilityRange } from "@/services/slots";
import { formatDisplayDate } from "@/lib/date-utils";
import { analytics } from "@/lib/analytics";

const bookingSchema = z.object({
  name: z.string().min(2, "Please enter the patient's full name (at least 2 characters)"),
  phone: z
    .string()
    .min(10, "Please enter a valid 10-digit mobile number so we can reach you")
    .regex(/^[+\d\s-()]{10,}$/, "Please enter a valid phone number with digits only"),
  dob: z.string().min(1, "Please select the patient's date of birth for identity verification"),
  preferredDate: z
    .string()
    .min(1, "Please select your preferred consultation date")
    .refine((date) => {
      const todayStr = new Date().toISOString().split("T")[0];
      const maxObj = new Date();
      maxObj.setDate(maxObj.getDate() + 2);
      const maxStr = maxObj.toISOString().split("T")[0];
      return date >= todayStr && date <= maxStr;
    }, "Consultations can only be booked up to 2 days in advance."),
  message: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface DoctorBookingModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
}

export function DoctorBookingModal({
  doctor,
  isOpen,
  onClose,
  onSuccess,
}: DoctorBookingModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [slotsState, setSlotsState] = useState<{
    isFullyUnavailable: boolean;
    reason?: string;
    start_time?: string;
    end_time?: string;
  }>({ isFullyUnavailable: false });
  const [serverError, setServerError] = useState<string | null>(null);

  const dept = doctor ? departments.find((d) => d.slug === doctor.departmentSlug) : null;
  const displayName = doctor ? (doctor.name.startsWith("Dr.") ? doctor.name : `Dr. ${doctor.name}`) : "";

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const maxDateObj = new Date();
  maxDateObj.setDate(today.getDate() + 2);
  const maxDateStr = maxDateObj.toISOString().split("T")[0];

  const allowedDates = [0, 1, 2].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().split("T")[0];
    const label = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return { dateStr, label };
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      preferredDate: todayStr,
    },
  });

  const selectedDate = watch("preferredDate") || todayStr;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      setValue("preferredDate", todayStr);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen, setValue, todayStr]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Compute live availability using Single Postgres RPC Engine / local fallback
  useEffect(() => {
    if (!doctor || !selectedDate) {
      setSlotsState({ isFullyUnavailable: false });
      setIsFetchingSlots(false);
      return;
    }

    let isMounted = true;
    setIsFetchingSlots(true);

    fetchDoctorAvailabilityRange(doctor.id, selectedDate)
      .then((res) => {
        if (!isMounted) return;
        setSlotsState({
          isFullyUnavailable: !res.available,
          reason: res.reason || undefined,
          start_time: res.start_time || undefined,
          end_time: res.end_time || undefined,
        });
      })
      .finally(() => {
        if (isMounted) setIsFetchingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, doctor]);

  // Reset form when modal closes or doctor changes
  useEffect(() => {
    if (!isOpen) {
      reset({ preferredDate: todayStr });
      setSlotsState({ isFullyUnavailable: false });
      setServerError(null);
      setIsFetchingSlots(false);
    }
  }, [isOpen, reset, todayStr]);

  if (!mounted || !isOpen || !doctor) return null;

  const onSubmit = async (data: BookingFormData) => {
    setServerError(null);

    if (slotsState.isFullyUnavailable) {
      setServerError("Doctor is unavailable on this date. Please select another date.");
      return;
    }

    analytics.bookingSubmit(doctor.id, doctor.departmentSlug);

    const windowString = slotsState.start_time && slotsState.end_time
      ? `${slotsState.start_time} - ${slotsState.end_time}`
      : undefined;

    const response = await createBooking({
      doctorId: doctor.id,
      doctorName: displayName,
      departmentSlug: doctor.departmentSlug,
      departmentName: dept?.name || "General Medicine",
      patientName: data.name,
      patientPhone: data.phone,
      patientDob: data.dob,
      preferredDate: data.preferredDate,
      preferredTimeSlot: windowString,
      message: data.message,
    });

    if (!response.success || !response.booking) {
      setServerError(response.error || "Failed to create appointment. Please try again.");
      return;
    }

    analytics.bookingSuccess(
      response.booking.bookingReference,
      doctor.id,
      doctor.departmentSlug
    );

    onSuccess(response.booking);
  };

  const modalNode = (
    <AnimatePresence>
      {isOpen && doctor && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6"
          style={{ isolation: "isolate" }}
        >
          {/* Fixed Fullscreen Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#071b3d]/80 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Modal Dialog Card (Strict Viewport Containment) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg lg:max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[var(--mist)] flex flex-col text-left z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-doctor-name"
          >
        {/* 1. Sticky / Fixed Header */}
        <div className="bg-white z-20 border-b border-[var(--mist)] px-3 py-2 sm:px-6 sm:py-4 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {doctor.photoUrl ? (
              <div className="relative w-10 h-10 sm:w-13 sm:h-13 rounded-xl overflow-hidden shrink-0 border border-[var(--mist)] bg-[var(--cloud)]">
                <Image
                  src={doctor.photoUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="52px"
                />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl bg-[var(--cloud)] flex items-center justify-center shrink-0 border border-[var(--mist)] text-[var(--primary)]">
                <Stethoscope size={18} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="chip chip-diagnostic text-[10px] py-0.5 px-2 font-mono">
                  {dept?.name || "Specialist"}
                </span>
              </div>
              <h2 id="modal-doctor-name" className="font-display font-bold text-sm sm:text-lg text-[var(--navy-950)] truncate">
                Book with {displayName}
              </h2>
              <p className="text-xs text-[var(--slate)] truncate">{doctor.qualifications.join(", ")}</p>
              {doctor.languages && doctor.languages.length > 0 && (
                <p className="text-[11px] text-[var(--slate)] truncate hidden xs:block">
                  <span className="font-medium text-[var(--navy-950)]">Languages:</span> {doctor.languages.join(", ")}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full text-[var(--slate)] hover:text-[var(--navy-950)] hover:bg-[var(--cloud)] transition-colors shrink-0 ml-1"
            aria-label="Close booking form"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Form Container with Internal Scroll and Sticky Footer */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3.5 sm:px-6 sm:py-5 space-y-3.5 sm:space-y-4 overscroll-contain">
            {serverError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Patient Name */}
            <div>
              <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                Patient Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--slate)] pointer-events-none" />
                <input
                  type="text"
                  {...register("name")}
                  placeholder="e.g. Ananya Roy"
                  className="input-base w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors"
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            {/* Phone & DOB Grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--slate)] pointer-events-none" />
                  <input
                    type="tel"
                    {...register("phone")}
                    placeholder="+91 98765 43210"
                    className="input-base w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors"
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  max={todayStr}
                  {...register("dob")}
                  className="input-base w-full px-3.5 py-2.5 rounded-xl border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors text-[var(--navy-950)]"
                />
                {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob.message}</p>}
              </div>
            </div>

            {/* Preferred Appointment Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[var(--navy-950)]">
                  Preferred Appointment Date <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-[var(--primary)] font-semibold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                  Advance Booking: Max 2 Days
                </span>
              </div>

              {/* Quick 2-day date selector pills */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {allowedDates.map(({ dateStr, label }) => {
                  const isSelected = selectedDate === dateStr;
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setValue("preferredDate", dateStr, { shouldValidate: true })}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                        isSelected
                          ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
                          : "bg-[var(--cloud)]/60 text-[var(--navy-950)] border-[var(--mist)] hover:border-slate-300"
                      }`}
                    >
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  max={maxDateStr}
                  {...register("preferredDate")}
                  className={`input-base w-full px-3.5 py-2 rounded-xl border outline-none transition-colors text-xs text-[var(--navy-950)] ${
                    slotsState.isFullyUnavailable
                      ? "border-red-400 bg-red-50/50"
                      : "border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  }`}
                />
              </div>
              {errors.preferredDate && (
                <p className="text-xs text-red-500 mt-1">{errors.preferredDate.message}</p>
              )}

              {/* Fully Unavailable / Leave Notice */}
              {slotsState.isFullyUnavailable && (
                <div className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                  <Ban size={15} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Doctor Unavailable on {selectedDate ? formatDisplayDate(selectedDate) : "this date"}</p>
                    <p className="text-[11px] mt-0.5">{slotsState.reason || "Please select another consultation date."}</p>
                  </div>
                </div>
              )}

              {/* Live Consultation Hours for Selected Date */}
              {selectedDate && !slotsState.isFullyUnavailable && !isFetchingSlots && slotsState.start_time && slotsState.end_time && (
                <div className="mt-3 p-3 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wide">Expected Consultation Time</p>
                    <p className="text-sm font-semibold text-sky-900 mt-0.5">
                      {slotsState.start_time} - {slotsState.end_time}
                    </p>
                    {slotsState.reason && (
                      <p className="text-[11px] text-amber-700 mt-1.5 italic font-medium bg-amber-50 p-1.5 rounded border border-amber-100">
                        Note: {slotsState.reason}
                      </p>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                    <CalendarCheck size={14} className="text-sky-600" />
                  </div>
                </div>
              )}
            </div>


            {/* Optional Symptoms / Message */}
            <div>
              <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                Reason for Visit / Symptoms <span className="text-[var(--slate)] font-normal">(Optional)</span>
              </label>
              <textarea
                {...register("message")}
                rows={2}
                placeholder="Briefly describe what you'd like to consult about..."
                className="input-base w-full px-3.5 py-2.5 rounded-xl border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* 3. Sticky / Fixed Footer with Action Button */}
          <div className="shrink-0 bg-[var(--cloud)]/60 border-t border-[var(--mist)] px-4 py-3 sm:px-6 sm:py-4 space-y-2">
            {/* Realtime Feedback if user clicks submit with missing slots */}
            {serverError && (
              <p className="text-xs text-red-600 font-medium text-center">{serverError}</p>
            )}

            {/* No Payment Notice */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-[var(--cloud)] text-[11px] sm:text-xs text-[var(--blue-900)] flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[var(--primary)] shrink-0" />
              <span>
                <strong>No advance payment required.</strong> Consultation fee is payable at hospital reception.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-2.5 sm:py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <CalendarCheck size={18} />
                  <span>Submit Appointment Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )}
</AnimatePresence>
);

if (!mounted) return null;

return createPortal(modalNode, document.body);
}
