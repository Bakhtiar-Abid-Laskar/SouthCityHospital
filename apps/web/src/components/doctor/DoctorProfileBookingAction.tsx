"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CalendarCheck } from "lucide-react";
import type { Doctor, Appointment } from "@sch/types";

// Dynamic import for modal dialogs
const DoctorBookingModal = dynamic(
  () => import("@/components/booking/DoctorBookingModal").then((m) => m.DoctorBookingModal),
  { ssr: false }
);

const BookingConfirmationModal = dynamic(
  () => import("@/components/booking/BookingConfirmationModal").then((m) => m.BookingConfirmationModal),
  { ssr: false }
);

interface DoctorProfileBookingActionProps {
  doctor: Doctor;
  buttonClassName?: string;
  size?: "default" | "large";
}

export function DoctorProfileBookingAction({
  doctor,
  buttonClassName = "",
  size = "default",
}: DoctorProfileBookingActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const displayName = doctor.name.startsWith("Dr.") ? doctor.name : `Dr. ${doctor.name}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`btn btn-primary gap-2.5 font-semibold shadow-md hover:shadow-lg transition-all ${
          size === "large" ? "py-3.5 px-6 text-base" : "py-2.5 px-5 text-sm"
        } ${buttonClassName}`}
        aria-label={`Book Consultation with ${displayName}`}
      >
        <CalendarCheck size={size === "large" ? 20 : 18} aria-hidden="true" />
        <span>Book Consultation</span>
      </button>

      {isOpen && (
        <DoctorBookingModal
          doctor={doctor}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSuccess={(apt) => {
            setIsOpen(false);
            setConfirmedAppointment(apt);
          }}
        />
      )}

      {confirmedAppointment && (
        <BookingConfirmationModal
          appointment={confirmedAppointment}
          isOpen={!!confirmedAppointment}
          onClose={() => setConfirmedAppointment(null)}
        />
      )}
    </>
  );
}
