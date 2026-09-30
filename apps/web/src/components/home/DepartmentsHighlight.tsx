"use client";

import Link from "next/link";
import {
  Stethoscope, Bone, Brain, Scissors, Microscope, Baby,
  Zap, Droplets, HeartPulse, ScanFace, ShieldCheck, ArrowRight,
} from "lucide-react";
import { departments } from "@/data/departments";
import { ScrollReveal, StaggerReveal, StaggerItem, staggerItemVariants } from "@/components/ui/motion";

const iconMap: Record<string, React.ElementType> = {
  Stethoscope, Bone, Brain, Scissors, Microscope, Baby,
  Zap, Droplets, HeartPulse, ScanFace, ShieldCheck,
};

// Show 6 departments on home page
const HIGHLIGHT_COUNT = 6;

export function DepartmentsHighlight() {
  const highlighted = departments.slice(0, HIGHLIGHT_COUNT);

  return (
    <section
      aria-labelledby="departments-heading"
      className="py-[var(--section-y)]"
      style={{ background: "var(--white)" }}
    >
      <div className="container-site">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <ScrollReveal>
            <p className="eyebrow mb-3">Clinical Departments</p>
            <h2
              id="departments-heading"
              className="font-display text-display-lg"
              style={{ color: "var(--primary-dark)" }}
            >
              Specialised care,
              <br />
              under one roof.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Link
              href="/departments"
              className="btn btn-outline self-start sm:self-auto gap-2 whitespace-nowrap"
              aria-label="View all 11 departments"
            >
              All {departments.length} Departments
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </ScrollReveal>
        </div>

        {/* Grid */}
        <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {highlighted.map((dept) => {
            const Icon = iconMap[dept.icon] || Stethoscope;
            return (
              <StaggerItem
                key={dept.id}
                variants={staggerItemVariants}
              >
                <Link
                  href={`/departments`}
                  className="card flex gap-4 p-6 border border-[var(--mist)] group cursor-pointer items-start"
                  aria-label={`${dept.name} — ${dept.shortDescription}`}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors group-hover:bg-[var(--primary)] group-hover:text-white"
                    style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                    aria-hidden="true"
                  >
                    <Icon size={20} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-display font-semibold text-base mb-1 group-hover:text-[var(--primary)] transition-colors"
                      style={{ color: "var(--ink)" }}
                    >
                      {dept.name}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--slate)" }}>
                      {dept.shortDescription}
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerReveal>
      </div>
    </section>
  );
}
