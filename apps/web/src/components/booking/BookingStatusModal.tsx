"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Search } from "lucide-react";
import { BookingStatusChecker } from "./BookingStatusChecker";

interface BookingStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReference?: string;
  initialPhone?: string;
  initialDob?: string;
}

export function BookingStatusModal({
  isOpen,
  onClose,
  initialReference = "",
  initialPhone = "",
  initialDob = "",
}: BookingStatusModalProps) {
  const [mounted, setMounted] = useState(false);

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
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6"
      style={{ isolation: "isolate" }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#071b3d]/80 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[var(--mist)] flex flex-col text-left z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-status-heading"
      >
        {/* Header */}
        <div className="bg-[var(--navy-950)] text-white px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center shrink-0">
              <Search size={20} />
            </div>
            <div>
              <h2 id="booking-status-heading" className="font-display font-bold text-base sm:text-lg text-white">
                Check Appointment Status
              </h2>
              <p className="text-xs text-white/70">
                Track your consultation request with South City Hospital
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 bg-slate-50/50 overscroll-contain">
          <BookingStatusChecker
            initialReference={initialReference}
            initialPhone={initialPhone}
            initialDob={initialDob}
            autoSearch={Boolean(initialReference || (initialPhone && initialDob))}
            onClose={onClose}
            compact={true}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
