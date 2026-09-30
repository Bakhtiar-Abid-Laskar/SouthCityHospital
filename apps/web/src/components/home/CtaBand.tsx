"use client";

import Link from "next/link";
import { Phone, CalendarCheck } from "lucide-react";
import { hospital } from "@/data/hospital";
import { ScrollReveal } from "@/components/ui/motion";

import { DotGrid } from "@/components/ui/svg-patterns";

export function CtaBand() {
  return (
    <section
      aria-label="Book appointment call to action"
      className="py-10 sm:py-16 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, var(--blue-800) 0%, var(--blue-600) 100%)" }}
    >
      {/* ── Dot Grid Top Fade Transition ── */}
      <div 
        className="absolute inset-x-0 top-0 h-[120px] pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Soft base fade into page background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom,
              var(--page-bg, #ffffff) 0%,
              rgba(255,255,255,0.90) 20%,
              rgba(255,255,255,0.65) 40%,
              rgba(255,255,255,0.35) 60%,
              rgba(255,255,255,0.10) 80%,
              rgba(255,255,255,0) 100%
            )`
          }}
        />
        {/* High opacity small dots that dissolve smoothly into white */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1.5px 1.5px, var(--blue-900) 1.5px, transparent 0)",
            backgroundSize: "20px 20px",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>
      <DotGrid className="opacity-10" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--blue-500)] blur-[100px] opacity-30 pointer-events-none" />
      <div className="container-site relative z-10">
        <ScrollReveal margin="0px" className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-center md:text-left">
          <div>
            <h2
              className="font-display text-display-sm text-white mb-2"
            >
              Ready to book an appointment?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.70)" }} className="text-xs sm:text-sm">
              {hospital.opd.days}, {hospital.opd.hours} · Emergency 24/7
            </p>
          </div>
          <div className="flex flex-col xs:flex-row gap-2.5 sm:gap-3 justify-center w-full md:w-auto relative z-10">
            <Link
              href="/doctors"
              className="btn gap-2 w-full xs:w-auto justify-center min-h-[44px] text-xs sm:text-sm"
              style={{ background: "white", color: "var(--blue-800)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            >
              <CalendarCheck size={16} aria-hidden="true" />
              Book Appointment
            </Link>
            <a
              href={`tel:${hospital.contact.emergency.replace(/\s/g, "")}`}
              className="btn btn-emergency gap-2 w-full xs:w-auto justify-center min-h-[44px] text-xs sm:text-sm"
            >
              <Phone size={16} aria-hidden="true" />
              {hospital.contact.emergency}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
