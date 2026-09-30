import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CalendarCheck, ShieldAlert, Phone, HelpCircle, ArrowRight } from "lucide-react";
import { BookingStatusChecker } from "@/components/booking/BookingStatusChecker";
import { hospital } from "@/data/hospital";

export const metadata: Metadata = {
  title: "Check Appointment & Booking Status",
  description:
    "Track the real-time status of your South City Hospital appointment or doctor consultation in Silchar using your Booking Reference ID or registered mobile number.",
  alternates: {
    canonical: "https://southcityhospital.in/booking-status",
  },
};

interface BookingStatusPageProps {
  searchParams: Promise<{
    ref?: string;
    phone?: string;
    dob?: string;
  }>;
}

async function BookingStatusContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ ref?: string; phone?: string; dob?: string }>;
}) {
  const params = await searchParamsPromise;
  const initialRef = params.ref || "";
  const initialPhone = params.phone || "";
  const initialDob = params.dob || "";

  return (
    <BookingStatusChecker
      initialReference={initialRef}
      initialPhone={initialPhone}
      initialDob={initialDob}
      autoSearch={Boolean(initialRef || (initialPhone && initialDob))}
    />
  );
}

export default async function BookingStatusPage({ searchParams }: BookingStatusPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* ── Page Header / Hero ── */}
      <section
        className="relative bg-premium-atmosphere py-12 sm:py-16 text-white overflow-hidden text-center"
      >
        <div className="noise-overlay" aria-hidden="true" />
        <div className="container-site relative z-10 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white/90 mb-4 backdrop-blur-xs">
            <CalendarCheck size={14} className="text-[var(--accent)]" />
            <span>Patient Self-Service Portal</span>
          </div>

          <h1 className="font-display text-display-md sm:text-display-lg text-white font-bold leading-tight">
            Check Your Appointment Status
          </h1>

          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
            Verify real-time confirmation for your consultation at South City Hospital using either your <strong>Booking Reference ID</strong> or your <strong>Phone Number & Date of Birth</strong>.
          </p>
        </div>
      </section>

      {/* ── Main Checker Section ── */}
      <main className="container-site -mt-6 sm:-mt-8 mb-16 relative z-20 px-4">
        <Suspense
          fallback={
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 border border-slate-200 shadow-lg text-center">
              <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">Loading appointment verification tool...</p>
            </div>
          }
        >
          <BookingStatusContent searchParamsPromise={searchParams} />
        </Suspense>

        {/* ── FAQ & Support Accordion / Info Box ── */}
        <div className="max-w-2xl mx-auto mt-12 bg-white rounded-2xl sm:rounded-3xl border border-[var(--mist)] p-6 sm:p-8 shadow-xs">
          <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-[var(--primary)]" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 divide-y divide-slate-100">
            <div className="pt-3">
              <p className="font-bold text-slate-900">How long does confirmation take?</p>
              <p className="mt-1 leading-relaxed">
                Most appointment requests are reviewed and confirmed by our hospital administration staff within 1 to 2 business hours.
              </p>
            </div>

            <div className="pt-3">
              <p className="font-bold text-slate-900">What if I cannot find my Booking Reference ID?</p>
              <p className="mt-1 leading-relaxed">
                Use <strong>Method 2</strong> above by entering the 10-digit mobile number and date of birth provided during registration. All your active and historical bookings will be displayed.
              </p>
            </div>

            <div className="pt-3">
              <p className="font-bold text-slate-900">What should I bring on the day of consultation?</p>
              <p className="mt-1 leading-relaxed">
                Please bring a digital or printed copy of your booking slip (or note down your Booking Reference), a valid photo ID, and previous medical records or prescriptions.
              </p>
            </div>

            <div className="pt-3">
              <p className="font-bold text-slate-900">Need to reschedule or cancel?</p>
              <p className="mt-1 leading-relaxed">
                Please contact our hospital reception directly at{" "}
                <a
                  href={`tel:${hospital.contact.phone.replace(/\s/g, "")}`}
                  className="font-bold text-[var(--primary)] hover:underline"
                >
                  {hospital.contact.phone}
                </a>{" "}
                or emergency hotline{" "}
                <a
                  href={`tel:${hospital.contact.emergency.replace(/\s/g, "")}`}
                  className="font-bold text-rose-700 hover:underline"
                >
                  {hospital.contact.emergency}
                </a>
                .
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              href="/doctors"
              className="text-xs sm:text-sm font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1.5"
            >
              <span>Book a new appointment</span>
              <ArrowRight size={14} />
            </Link>

            <a
              href={`tel:${hospital.contact.emergency.replace(/\s/g, "")}`}
              className="text-xs text-rose-700 font-bold inline-flex items-center gap-1.5"
            >
              <ShieldAlert size={14} />
              <span>24/7 Emergency: {hospital.contact.emergency}</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
