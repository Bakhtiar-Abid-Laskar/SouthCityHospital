import type { Metadata } from "next";
import {
  Search, FlaskConical, HeartPulse, Gauge, Heart,
  Scan, ScanSearch, Waves, BrainCircuit, Droplets, TestTube, Activity
} from "lucide-react";
import { facilities, facilityCategories, type FacilityCategory } from "@/data/facilities";
import { ScrollReveal, StaggerReveal, StaggerItem, staggerItemVariants, Floating } from "@/components/ui/motion";
import { CtaBand } from "@/components/home/CtaBand";
import { FloatingBlobs, PulseLineWatermark } from "@/components/ui/svg-patterns";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Diagnostic & Emergency Facilities",
  description:
    "Discover 24/7 diagnostic and critical care facilities at South City Hospital in Silchar, including Multi-Slice CT-Scan, ICU/CCU, Dialysis, and Pathology Lab.",
  alternates: {
    canonical: "https://southcityhospital.in/facilities",
  },
};

const iconMap: Record<string, React.ElementType> = {
  Search, FlaskConical, HeartPulse, Gauge, Heart,
  Scan, ScanSearch, Waves, BrainCircuit, Droplets, TestTube, Activity
};

const categoryStyle: Record<FacilityCategory, { chip: string; heading: string; bg: string }> = {
  Diagnostic: { chip: "bg-[var(--teal-400)]/10 text-[var(--teal-600)] border-[var(--teal-400)]/20", heading: "Diagnostic Services", bg: "var(--teal-400)" },
  "Critical Care": { chip: "bg-[var(--coral-600)]/10 text-[var(--coral-600)] border-[var(--coral-600)]/20", heading: "Critical Care Units", bg: "var(--coral-600)" },
  Outpatient: { chip: "bg-[var(--blue-500)]/10 text-[var(--blue-700)] border-[var(--blue-500)]/20", heading: "Outpatient Services", bg: "var(--blue-500)" },
};

export default function FacilitiesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-8 pb-10 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20 relative overflow-hidden bg-hero-gradient" aria-label="Facilities hero">
        <FloatingBlobs />
        <PulseLineWatermark />
        <div className="container-site relative z-10">
          <ScrollReveal className="max-w-2xl">
            <p className="eyebrow text-[var(--accent)] mb-3 sm:mb-4">Facilities & Services</p>
            <h1 className="font-display text-display-xl text-white mb-3 sm:mb-4">
              Advanced diagnostics,<br />
              <em className="not-italic" style={{ color: "var(--accent)" }}>round the clock.</em>
            </h1>
            <p className="text-white/75 text-base sm:text-lg">
              {facilities.length} state-of-the-art diagnostic and critical care facilities at South City Hospital, serving patients across Silchar and the Barak Valley.
            </p>
            </ScrollReveal>
        </div>
      </section>

      {/* Grouped Facilities */}
      <section className="py-[var(--section-y)]" style={{ background: "var(--white)" }} aria-label="All facilities">
        <div className="container-site space-y-10 sm:space-y-14">
          {facilityCategories.map((category) => {
            const catFacilities = facilities.filter((f) => f.category === category);
            if (catFacilities.length === 0) return null;
            const style = categoryStyle[category];

            return (
              <div key={category} className="relative pl-3.5 sm:pl-6 md:pl-10 border-l-2" style={{ borderColor: style.bg }}>
                <div className="absolute top-0 left-[-9px] w-4 h-4 rounded-full border-4 border-[var(--white)]" style={{ background: style.bg }} aria-hidden="true" />
                <ScrollReveal className="mb-6 sm:mb-8">
                  <h2 className="font-display text-display-sm" style={{ color: "var(--blue-950)" }}>
                    {style.heading}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--slate)" }}>
                    {catFacilities.length} {catFacilities.length === 1 ? "facility" : "facilities"}
                  </p>
                </ScrollReveal>

                <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {catFacilities.map((facility, index) => {
                    const Icon = iconMap[facility.icon] || Search;
                    return (
                      <StaggerItem
                        key={facility.id}
                        variants={staggerItemVariants}
                        className="card border flex flex-col bg-white transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-1 group overflow-hidden"
                        style={{ borderColor: "rgba(208,213,221,0.5)" }}
                      >
                        <div className="p-6 flex flex-col gap-5 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors"
                              style={{ background: "var(--sky-100)", color: "var(--blue-700)" }}
                              aria-hidden="true"
                            >
                              <Icon size={24} className="group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <span className={cn("px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border", style.chip)}>{category}</span>
                          </div>
                          <div>
                            <h3 className="font-display font-semibold text-lg mb-1.5" style={{ color: "var(--navy-950)" }}>
                              {facility.name}
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--slate)" }}>
                              {facility.description}
                            </p>
                          </div>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </StaggerReveal>
              </div>
            );
          })}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
