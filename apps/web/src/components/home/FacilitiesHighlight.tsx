"use client";

import Link from "next/link";

import {
  Search, FlaskConical, HeartPulse, Gauge, Heart,
  Scan, ScanSearch, Waves, BrainCircuit, Droplets, ArrowRight, TestTube, Activity
} from "lucide-react";
import { facilities } from "@/data/facilities";
import { ScrollReveal, StaggerReveal, StaggerItem, staggerItemVariants } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Search, FlaskConical, HeartPulse, Gauge, Heart,
  Scan, ScanSearch, Waves, BrainCircuit, Droplets, TestTube, Activity
};

const categoryStyle: Record<string, string> = {
  Diagnostic: "chip chip-diagnostic",
  "Critical Care": "chip chip-critical",
  Outpatient: "chip chip-outpatient",
};

const HIGHLIGHT_COUNT = 6;

export function FacilitiesHighlight() {
  const highlighted = facilities.slice(0, HIGHLIGHT_COUNT);

  return (
    <section
      aria-labelledby="facilities-heading"
      className="py-[var(--section-y)]"
      style={{ background: "var(--white)" }}
    >
      <div className="container-site">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <ScrollReveal>
            <p className="eyebrow mb-3">Diagnostic & Care Facilities</p>
            <h2
              id="facilities-heading"
              className="font-display text-display-lg"
              style={{ color: "var(--primary-dark)" }}
            >
              Advanced diagnostics,
              <br />
              round the clock.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Link
              href="/facilities"
              className="btn btn-outline gap-2 whitespace-nowrap self-start"
              aria-label="View all 12 facilities"
            >
              All {facilities.length} Facilities
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </ScrollReveal>
        </div>

        <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {highlighted.map((facility) => {
            const Icon = iconMap[facility.icon] || Search;
            return (
              <StaggerItem
                key={facility.id}
                variants={staggerItemVariants}
                className="card p-6 border border-[var(--mist)] flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--sky-100)", color: "var(--blue-700)" }}
                    aria-hidden="true"
                  >
                    <Icon size={20} />
                  </div>
                  <span className={cn(categoryStyle[facility.category] || "chip chip-diagnostic")}>
                    {facility.category}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--ink)" }}>
                    {facility.name}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--slate)" }}>
                    {facility.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerReveal>
      </div>
    </section>
  );
}
