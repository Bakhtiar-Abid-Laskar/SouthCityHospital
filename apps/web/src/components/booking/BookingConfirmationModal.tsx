"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  Download,
  Copy,
  Check,
  Calendar,
  Clock,
  User,
  Phone,
  Stethoscope,
  X,
  Camera,
  Search,
  CalendarPlus,
  Info,
} from "lucide-react";
import Link from "next/link";
import type { Appointment } from "@sch/types";
import { formatDisplayDate } from "@/lib/date-utils";
import { downloadBookingSlipPdf } from "@/lib/pdf-slip";
import { buildGoogleCalendarUrl, downloadIcsCalendarFile } from "@/lib/calendar";
import { getDepartmentPrepInstructions } from "@/data/prep-instructions";
import { analytics } from "@/lib/analytics";

interface BookingConfirmationModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingConfirmationModal({
  appointment,
  isOpen,
  onClose,
}: BookingConfirmationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

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

  if (!mounted || !isOpen || !appointment) return null;

  const prepNote = getDepartmentPrepInstructions(appointment.departmentSlug);
  const googleCalUrl = buildGoogleCalendarUrl(appointment);

  const handleCopy = () => {
    navigator.clipboard.writeText(appointment.bookingReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      analytics.pdfDownload(appointment.bookingReference);
      await downloadBookingSlipPdf(appointment);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleAppleOutlookIcs = () => {
    downloadIcsCalendarFile(appointment);
  };

  const modalNode = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6"
      style={{ isolation: "isolate" }}
    >
      {/* Fixed Fullscreen Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#071b3d]/80 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Card (Strict Viewport Containment) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg lg:max-w-xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[var(--mist)] flex flex-col text-left z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-heading"
      >
        {/* 1. Header */}
        <div className="bg-[var(--navy-950)] text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
              appointment.status === "Pending"
                ? "bg-amber-500/20 text-amber-400"
                : "bg-emerald-500/20 text-emerald-400"
            }`}>
              {appointment.status === "Pending" ? <Clock size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <div>
              <h2 id="confirmation-heading" className="font-display font-bold text-sm sm:text-lg">
                {appointment.status === "Pending" ? "Appointment Request Received" : "Appointment Confirmed"}
              </h2>
              <p className="text-[11px] sm:text-xs text-white/70">
                South City Hospital · Meherpur {appointment.status === "Pending" && "· Pending Admin Confirmation"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close confirmation"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1 min-h-0 overscroll-contain">
          {/* Status Explanation Box */}
          {appointment.status === "Pending" ? (
            <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 flex items-start gap-2.5 sm:gap-3 shadow-xs">
              <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                <Clock size={18} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-amber-900 leading-tight">Status: Pending Admin Confirmation</p>
                <p className="text-amber-800/90 mt-1 leading-relaxed text-[11px]">
                  Your appointment request has been submitted. Our hospital administration staff will review and mark it <strong>Confirmed</strong> shortly. You can check your booking status anytime using your reference ID.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 flex items-start gap-2.5 sm:gap-3 shadow-xs">
              <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                <CheckCircle2 size={18} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-emerald-900 leading-tight">Status: Confirmed by Hospital</p>
                <p className="text-emerald-800/90 mt-1 leading-relaxed text-[11px]">
                  Your consultation slot is confirmed. Please arrive 15 minutes before your time window.
                </p>
              </div>
            </div>
          )}

          {/* Screenshot Alert Box */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-950 flex items-center gap-2.5 sm:gap-3 shadow-xs">
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-800 shrink-0">
              <Camera size={18} />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Please save or screenshot this slip</p>
              <p className="text-[11px] text-blue-800/80 mt-0.5">
                Show this reference ID at the registration desk when visiting the hospital.
              </p>
            </div>
          </div>

          {/* Booking Reference Box */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--white)] border border-[var(--mist)] flex items-center justify-between gap-2 shadow-2xs">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--slate)]">
                Booking Reference ID
              </p>
              <p className="font-mono font-bold text-base sm:text-xl text-[var(--navy-950)] mt-0.5 truncate">
                {appointment.bookingReference}
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-outline text-xs py-1.5 px-2.5 sm:px-3 gap-1 min-h-[36px]"
                title="Copy Reference"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <span className={`chip text-[10px] sm:text-[11px] font-bold py-1 px-2 sm:px-2.5 ${
                appointment.status === "Pending"
                  ? "bg-amber-50 text-amber-800 border border-amber-300"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                {appointment.status}
              </span>
            </div>
          </div>

          {/* Consultation Details Grid */}
          <div className="border border-[var(--mist)] rounded-xl overflow-hidden divide-y divide-[var(--mist)] text-xs sm:text-sm">
            <div className="p-3 sm:p-3.5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 text-[var(--slate)]">
                <Stethoscope size={15} className="text-[var(--primary)] shrink-0" />
                <span>Doctor</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[var(--navy-950)]">{appointment.doctorName}</p>
                <p className="text-[11px] text-[var(--slate)]">{appointment.departmentName}</p>
              </div>
            </div>

            <div className="p-3 sm:p-3.5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 text-[var(--slate)]">
                <Calendar size={15} className="text-[var(--primary)] shrink-0" />
                <span>Appointment Date</span>
              </div>
              <p className="font-semibold text-[var(--navy-950)]">
                {formatDisplayDate(appointment.preferredDate)}
              </p>
            </div>

            <div className="p-3 sm:p-3.5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 text-[var(--slate)]">
                <Clock size={15} className="text-[var(--primary)] shrink-0" />
                <span>Consultation Window</span>
              </div>
              <p className="font-semibold text-[var(--navy-950)]">
                {appointment.preferredTimeSlot || "Hospital OPD Hours"}
              </p>
            </div>

            <div className="p-3 sm:p-3.5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 text-[var(--slate)]">
                <User size={15} className="text-[var(--primary)] shrink-0" />
                <span>Patient Name</span>
              </div>
              <p className="font-semibold text-[var(--navy-950)]">{appointment.patientName}</p>
            </div>

            <div className="p-3 sm:p-3.5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 text-[var(--slate)]">
                <Phone size={15} className="text-[var(--primary)] shrink-0" />
                <span>Contact Phone</span>
              </div>
              <p className="font-semibold text-[var(--navy-950)]">{appointment.patientPhone}</p>
            </div>
          </div>

          {/* Department Preparation Instructions */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--sky-100)]/70 border border-[var(--mist)] flex items-start gap-2.5 text-xs text-[var(--navy-950)]">
            <Info size={15} className="text-[var(--primary)] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[var(--navy-950)]">Consultation Preparation:</p>
              <p className="text-[var(--slate)] mt-0.5 leading-relaxed">{prepNote}</p>
            </div>
          </div>

          {/* Add to Calendar Button Row */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] sm:text-[11px] font-bold text-[var(--slate)] uppercase tracking-wider">
              Add Reminder to Calendar
            </p>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline text-xs py-2 px-3 flex items-center justify-center gap-1.5 hover:bg-white min-h-[38px]"
              >
                <CalendarPlus size={14} className="text-[var(--primary)]" />
                <span>Google Calendar</span>
              </a>

              <button
                type="button"
                onClick={handleAppleOutlookIcs}
                className="btn btn-outline text-xs py-2 px-3 flex items-center justify-center gap-1.5 hover:bg-white min-h-[38px]"
              >
                <Download size={14} className="text-[var(--primary)]" />
                <span>Apple / Outlook (.ics)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Sticky / Fixed Footer */}
        <div className="shrink-0 bg-[var(--cloud)]/60 border-t border-[var(--mist)] px-4 py-3 sm:px-6 sm:py-4 space-y-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="btn btn-primary w-full py-2.5 sm:py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download Reference Slip (PDF)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline w-full py-2 text-xs font-semibold text-[var(--slate)] hover:text-[var(--navy-950)] bg-white min-h-[38px]"
          >
            Close &amp; Return
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
