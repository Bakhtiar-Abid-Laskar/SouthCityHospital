import type { Metadata } from "next";
import Link from "next/link";
import { Stethoscope, Home, Phone, ArrowRight, HelpCircle } from "lucide-react";
import { hospital } from "@/data/hospital";
import { FloatingBlobs, PulseLineWatermark } from "@/components/ui/svg-patterns";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The requested page is unavailable. Access 24/7 emergency care, clinical departments, or book an appointment at South City Hospital in Silchar.",
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden bg-hero-gradient py-16 px-4">
      <FloatingBlobs />
      <PulseLineWatermark />

      <div className="container-site relative z-10 max-w-2xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[var(--accent)] text-xs font-mono mb-6 border border-white/15">
          <HelpCircle size={14} />
          <span>Page Not Found · Error 404</span>
        </div>

        {/* Heading */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
          Let’s help you find the <br />
          <em className="not-italic" style={{ color: "var(--accent)" }}>right healthcare service.</em>
        </h1>

        <p className="text-white/75 text-base sm:text-lg mb-8 max-w-lg mx-auto leading-relaxed">
          The page or department link you requested may have moved or is no longer available. Here are the fastest ways to get the care you need:
        </p>

        {/* Primary Action Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-4 text-left mb-8">
          {/* Card 1: Find a Doctor */}
          <Link
            href="/doctors"
            className="card p-5 bg-white/95 hover:bg-white text-[var(--navy-950)] rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 group border border-white/20 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--sky-100)] text-[var(--primary)] flex items-center justify-center">
                <Stethoscope size={20} />
              </div>
              <ArrowRight size={16} className="text-[var(--slate)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-[var(--navy-950)]">
                Search Doctors &amp; Book
              </h2>
              <p className="text-xs text-[var(--slate)] mt-1">
                View specialists across 13 clinical departments and book an appointment.
              </p>
            </div>
          </Link>

          {/* Card 2: 24/7 Emergency Helpline */}
          <a
            href={`tel:${hospital.contact.emergency.replace(/\s/g, "")}`}
            className="card p-5 bg-red-50 hover:bg-red-100/90 text-red-950 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 group border border-red-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
                <Phone size={20} />
              </div>
              <span className="chip chip-diagnostic text-[10px] bg-red-100 text-red-700 font-bold border border-red-300">
                24/7 Live
              </span>
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-red-950">
                Emergency Helpline
              </h2>
              <p className="text-xs text-red-800/80 mt-1">
                Call {hospital.contact.emergency} immediately for ambulance and critical care.
              </p>
            </div>
          </a>
        </div>

        {/* Secondary Links Row */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="btn btn-primary text-xs py-2.5 px-4 gap-2 inline-flex items-center shadow-md"
          >
            <Home size={15} />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/doctors"
            className="btn btn-outline text-xs py-2.5 px-4 gap-2 inline-flex items-center text-white border-white/25 hover:bg-white/10 hover:text-white"
          >
            <Stethoscope size={15} />
            <span>Find a Doctor</span>
          </Link>

          <Link
            href="/contact"
            className="btn btn-ghost text-xs py-2.5 px-4 text-white/70 hover:text-white hover:bg-white/10"
          >
            Contact Hospital
          </Link>
        </div>
      </div>
    </div>
  );
}
