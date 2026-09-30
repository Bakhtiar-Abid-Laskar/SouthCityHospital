"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Phone,
  Calendar,
  CalendarPlus,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RotateCcw,
  Stethoscope,
  Building2,
  User,
  ShieldAlert,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Appointment, AppointmentStatus } from "@sch/types";
import { lookupBooking } from "@/services/appointments";
import { formatDisplayDate } from "@/lib/date-utils";
import { downloadBookingSlipPdf } from "@/lib/pdf-slip";
import { buildGoogleCalendarUrl, downloadIcsCalendarFile } from "@/lib/calendar";
import { hospital } from "@/data/hospital";

type SearchMethod = "reference" | "phone_dob";

interface BookingStatusCheckerProps {
  initialReference?: string;
  initialPhone?: string;
  initialDob?: string;
  autoSearch?: boolean;
  onClose?: () => void;
  compact?: boolean;
}

export function BookingStatusChecker({
  initialReference = "",
  initialPhone = "",
  initialDob = "",
  autoSearch = false,
  onClose,
  compact = false,
}: BookingStatusCheckerProps) {
  const [method, setMethod] = useState<SearchMethod>(
    initialReference ? "reference" : initialPhone && initialDob ? "phone_dob" : "reference"
  );

  // Form states
  const [bookingRef, setBookingRef] = useState(initialReference);
  const [phone, setPhone] = useState(initialPhone);
  const [dob, setDob] = useState(initialDob);

  // Execution states
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Appointment[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Copy reference state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Auto-search if requested on mount
  useEffect(() => {
    if (autoSearch && (initialReference.trim() || (initialPhone.trim() && initialDob.trim()))) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setResults([]);

    if (method === "reference") {
      const cleanRef = bookingRef.trim().toUpperCase();
      if (!cleanRef) {
        setErrorMsg("Please enter your Booking Reference number (e.g., SCH-2026-00001).");
        return;
      }
      setIsLoading(true);
      try {
        const res = await lookupBooking({ bookingReference: cleanRef });
        setHasSearched(true);
        if (res.success && res.bookings) {
          setResults(res.bookings);
        } else {
          setErrorMsg(res.error || "No booking found with this reference number.");
        }
      } catch {
        setErrorMsg("Unable to retrieve booking status right now. Please try again or contact the hospital desk.");
      } finally {
        setIsLoading(false);
      }
    } else {
      const cleanDigits = phone.replace(/\D/g, "");
      const cleanDob = dob.trim();

      if (cleanDigits.length < 10) {
        setErrorMsg("Please enter a valid 10-digit mobile number.");
        return;
      }
      if (!cleanDob) {
        setErrorMsg("Please select or enter the patient's Date of Birth.");
        return;
      }

      setIsLoading(true);
      try {
        const res = await lookupBooking({
          patientPhone: cleanDigits,
          patientDob: cleanDob,
        });
        setHasSearched(true);
        if (res.success && res.bookings) {
          setResults(res.bookings);
        } else {
          setErrorMsg(res.error || "No appointments found matching this phone number and date of birth.");
        }
      } catch {
        setErrorMsg("Unable to retrieve booking status right now. Please try again or contact the hospital desk.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopy = (refText: string) => {
    navigator.clipboard.writeText(refText).then(() => {
      setCopiedId(refText);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handleDownloadPdf = async (apt: Appointment) => {
    setDownloadingId(apt.id);
    try {
      await downloadBookingSlipPdf(apt);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleReset = () => {
    setHasSearched(false);
    setResults([]);
    setErrorMsg(null);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "Confirmed":
        return {
          icon: <CheckCircle2 size={16} className="text-emerald-600" />,
          label: "Confirmed by Hospital",
          badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
          desc: "Your slot has been approved. Please arrive 15 minutes before your time window.",
        };
      case "Pending":
        return {
          icon: <Clock size={16} className="text-amber-600" />,
          label: "Pending Admin Confirmation",
          badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
          desc: "Your booking request is being reviewed by the administration team.",
        };
      case "Completed":
        return {
          icon: <Stethoscope size={16} className="text-blue-600" />,
          label: "Consultation Completed",
          badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
          desc: "This consultation has been completed.",
        };
      case "Cancelled":
        return {
          icon: <XCircle size={16} className="text-rose-600" />,
          label: "Cancelled",
          badgeClass: "bg-rose-50 text-rose-800 border-rose-200",
          desc: "This appointment has been cancelled. Please book a new slot if needed.",
        };
      default:
        return {
          icon: <AlertCircle size={16} className="text-slate-600" />,
          label: status,
          badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
          desc: "Please contact South City Hospital reception for current status.",
        };
    }
  };

  return (
    <div className={`w-full ${compact ? "p-0" : "max-w-2xl mx-auto"}`}>
      {/* ── Search Form (when not showing results or when results are empty) ── */}
      {!hasSearched || results.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[var(--mist)] shadow-lg overflow-hidden p-5 sm:p-7 md:p-8">
          {/* Method Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setMethod("reference");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                method === "reference"
                  ? "bg-white text-[var(--primary-dark)] shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Search size={15} />
              <span>1. Booking Reference ID</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod("phone_dob");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                method === "phone_dob"
                  ? "bg-white text-[var(--primary-dark)] shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Phone size={15} />
              <span>2. Phone & Date of Birth</span>
            </button>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <AnimatePresence mode="wait">
              {method === "reference" ? (
                <motion.div
                  key="tab-ref"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-2"
                >
                  <label
                    htmlFor="booking-ref-input"
                    className="block text-xs sm:text-sm font-bold text-slate-800"
                  >
                    Booking Reference Number
                  </label>
                  <div className="relative">
                    <input
                      id="booking-ref-input"
                      type="text"
                      value={bookingRef}
                      onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
                      placeholder="e.g. SCH-2026-00001"
                      className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-slate-300 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-hidden font-mono uppercase font-semibold text-slate-900 placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 text-sm sm:text-base tracking-wide transition-all"
                      autoFocus
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Search size={18} />
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Found on your booking confirmation slip or confirmation SMS.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="tab-phone-dob"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="patient-phone-input"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1"
                    >
                      Registered Mobile Number
                    </label>
                    <div className="relative flex rounded-xl border border-slate-300 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all overflow-hidden">
                      <span className="inline-flex items-center px-3.5 bg-slate-50 border-r border-slate-200 text-slate-600 text-xs sm:text-sm font-semibold select-none">
                        +91
                      </span>
                      <input
                        id="patient-phone-input"
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-3 sm:py-3.5 outline-hidden font-medium text-slate-900 placeholder:text-slate-400 text-sm sm:text-base"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="patient-dob-input"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1"
                    >
                      Patient Date of Birth (DOB)
                    </label>
                    <div className="relative">
                      <input
                        id="patient-dob-input"
                        type="date"
                        value={dob}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-slate-300 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-hidden font-medium text-slate-900 text-sm sm:text-base transition-all"
                      />
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                      Required for patient privacy and record verification.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <p className="font-semibold">{errorMsg}</p>
                  <p className="text-xs text-rose-700 mt-1">
                    Need help? Call our hospital helpdesk at{" "}
                    <a
                      href={`tel:${hospital.contact.phone.replace(/\s/g, "")}`}
                      className="font-bold underline"
                    >
                      {hospital.contact.phone}
                    </a>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-3.5 px-6 text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Searching South City Hospital Records...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>{method === "reference" ? "Check Booking Status" : "Find My Appointments"}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Help Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-amber-600 shrink-0" />
              <span>Emergency 24x7: {hospital.contact.emergency}</span>
            </div>
            <span>South City Hospital · Silchar</span>
          </div>
        </div>
      ) : null}

      {/* ── Search Results ── */}
      {hasSearched && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between bg-white px-4 sm:px-6 py-3.5 rounded-2xl border border-[var(--mist)] shadow-xs">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                Found {results.length} {results.length === 1 ? "Appointment" : "Appointments"}
              </p>
              <p className="text-[11px] text-slate-500">
                {method === "reference" ? `Reference ID: ${bookingRef}` : `Phone: +91 ${phone}`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-outline text-xs sm:text-sm py-1.5 px-3 gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Check Another</span>
            </button>
          </div>

          {/* Appointment Cards */}
          {results.map((apt) => {
            const badge = getStatusBadge(apt.status);
            return (
              <div
                key={apt.id || apt.bookingReference}
                className="bg-white rounded-2xl sm:rounded-3xl border border-[var(--mist)] shadow-lg overflow-hidden text-left transition-all"
              >
                {/* Header with Reference & Status */}
                <div className="bg-[var(--navy-950)] text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">
                      Booking Reference
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-lg sm:text-2xl text-[var(--accent)]">
                        {apt.bookingReference}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(apt.bookingReference)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Copy Reference ID"
                      >
                        {copiedId === apt.bookingReference ? (
                          <Check size={16} className="text-emerald-400" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                      {copiedId === apt.bookingReference && (
                        <span className="text-[11px] text-emerald-400 font-medium">Copied!</span>
                      )}
                    </div>
                  </div>

                  <div className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badge.badgeClass}`}>
                    {badge.icon}
                    <span>{badge.label}</span>
                  </div>
                </div>

                {/* Body details */}
                <div className="p-5 sm:p-7 space-y-5">
                  {/* Status explanation */}
                  <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm ${
                    apt.status === "Confirmed"
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                      : apt.status === "Pending"
                      ? "bg-amber-50/70 border-amber-200 text-amber-950"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}>
                    <div className="mt-0.5 shrink-0">{badge.icon}</div>
                    <div>
                      <p className="font-bold">{badge.label}</p>
                      <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{badge.desc}</p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    {/* Patient */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <p className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                        <User size={13} />
                        Patient Details
                      </p>
                      <p className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                        {apt.patientName}
                      </p>
                      <p className="text-slate-600 mt-0.5 font-mono text-xs">
                        +91 {apt.patientPhone}
                      </p>
                      {apt.patientDob && (
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          DOB: {apt.patientDob}
                        </p>
                      )}
                    </div>

                    {/* Doctor & Dept */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <p className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                        <Stethoscope size={13} />
                        Consulting Specialist
                      </p>
                      <p className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                        {apt.doctorName}
                      </p>
                      <p className="text-[var(--primary)] font-semibold text-xs mt-0.5 flex items-center gap-1">
                        <Building2 size={12} />
                        {apt.departmentName}
                      </p>
                    </div>

                    {/* Schedule */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <p className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                        <Calendar size={13} />
                        Appointment Date
                      </p>
                      <p className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                        {formatDisplayDate(apt.preferredDate)}
                      </p>
                      <p className="text-slate-600 text-xs mt-0.5 flex items-center gap-1">
                        <Clock size={12} />
                        {apt.preferredTimeSlot || "Hospital Working Hours (OPD)"}
                      </p>
                    </div>

                    {/* Hospital Venue */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <p className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500">
                        Hospital Location
                      </p>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
                        South City Hospital (OPD Desk)
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">
                        {hospital.location.address}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2.5">
                    {/* PDF Download */}
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(apt)}
                      disabled={downloadingId === apt.id}
                      className="btn btn-outline text-xs sm:text-sm py-2 px-3.5 gap-2 flex-1 sm:flex-initial"
                    >
                      {downloadingId === apt.id ? (
                        <Loader2 size={16} className="animate-spin text-[var(--primary)]" />
                      ) : (
                        <Download size={16} className="text-[var(--primary)]" />
                      )}
                      <span>Download PDF Slip</span>
                    </button>

                    {/* Google Calendar */}
                    <a
                      href={buildGoogleCalendarUrl(apt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline text-xs sm:text-sm py-2 px-3.5 gap-2 flex-1 sm:flex-initial text-slate-700"
                    >
                      <CalendarPlus size={16} />
                      <span>Add to Google Calendar</span>
                    </a>

                    {/* Hospital Helpline */}
                    <a
                      href={`tel:${hospital.contact.phone.replace(/\s/g, "")}`}
                      className="btn btn-outline text-xs sm:text-sm py-2 px-3.5 gap-2 text-slate-700"
                    >
                      <Phone size={16} />
                      <span>Call Helpdesk</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Reset / Search Another button */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs sm:text-sm font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Search another appointment</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
