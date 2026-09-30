"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  Stethoscope, Bone, Brain, Scissors, Microscope, Baby,
  Zap, Droplets, HeartPulse, ScanFace, ShieldCheck, ChevronDown, CheckCircle2,
  ScanSearch, Syringe, Dna, ArrowRight
} from "lucide-react";
import { departments } from "@/data/departments";
import { ScrollReveal, StaggerReveal, StaggerItem, staggerItemVariants } from "@/components/ui/motion";
import { CtaBand } from "@/components/home/CtaBand";
import { FloatingBlobs, PulseLineWatermark } from "@/components/ui/svg-patterns";

const iconMap: Record<string, React.ElementType> = {
  Stethoscope, Bone, Brain, Scissors, Microscope, Baby,
  Zap, Droplets, HeartPulse, ScanFace, ShieldCheck, ScanSearch, Syringe, Dna
};

function DepartmentCard({ dept }: { dept: (typeof departments)[0] }) {
  const [open, setOpen] = useState(false);
  const Icon = iconMap[dept.icon] || Stethoscope;

  return (
    <StaggerItem variants={staggerItemVariants}
      className="card rounded-[var(--radius-card)] overflow-hidden transition-all duration-300 border border-[rgba(208,213,221,0.4)]"
      style={{ 
        borderColor: open ? "rgba(46, 107, 209, 0.4)" : undefined, 
        boxShadow: open ? "var(--shadow-hover)" : "var(--shadow-card)",
        transform: open ? "translateY(-4px)" : "translateY(0)"
      }}
    >
      <button
        id={`dept-btn-${dept.id}`}
        aria-expanded={open}
        aria-controls={`dept-panel-${dept.id}`}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex gap-4 p-5 text-left transition-colors items-center"
        style={{ background: open ? "var(--blue-50)" : "var(--white)" }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-sm"
          style={{ background: open ? "var(--blue-700)" : "var(--sky-100)", color: open ? "white" : "var(--blue-700)" }} aria-hidden="true">
          <Icon size={22} />
        </div>

        <div className="flex-1 min-w-0 self-center">
          <h3 className="font-display font-semibold text-lg mb-1 transition-colors" style={{ color: open ? "var(--navy-950)" : "var(--ink)" }}>{dept.name}</h3>
          <p className="text-sm leading-snug" style={{ color: "var(--slate)" }}>{dept.shortDescription}</p>
        </div>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="shrink-0 self-center">
          <ChevronDown size={20} style={{ color: "var(--blue-500)" }} aria-hidden="true" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={`dept-panel-${dept.id}`} role="region" aria-labelledby={`dept-btn-${dept.id}`}
            key="detail" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden" style={{ background: "var(--white)" }}>
              <div className="px-5 pb-6 pt-2 space-y-5">
                <p className="text-sm leading-relaxed" style={{ color: "var(--slate)" }}>{dept.overview}</p>
                <div className="bg-[var(--white)] rounded-xl p-4 border border-[var(--blue-100)]">
                  <p className="eyebrow mb-3" style={{ color: "var(--blue-800)" }}>Common Treatments</p>
                  <ul className="space-y-2">
                    {dept.commonTreatments.map((t) => (
                      <li key={t} className="flex items-center gap-2.5 text-sm font-medium" style={{ color: "var(--ink-900)" }}>
                        <CheckCircle2 size={16} style={{ color: "var(--accent)" }} aria-hidden="true" />{t}
                      </li>
                    ))}
                </ul>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--mist)]">
                <Link
                  href={`/departments/${dept.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
                >
                  <span>Explore full {dept.name} services & treatments</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
                <Link
                  href={`/doctors?department=${dept.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--slate)] hover:text-[var(--primary)] transition-colors"
                >
                  <span>Consult doctor</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </StaggerItem>
  );
}

export function DepartmentsClient() {
  return (
    <>
      <section className="pt-8 pb-10 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20 relative overflow-hidden bg-hero-gradient" aria-label="Departments hero">
        <FloatingBlobs />
        <PulseLineWatermark />
        <div className="container-site relative z-10">
          <ScrollReveal className="max-w-2xl">
            <p className="eyebrow text-white/60 mb-3 sm:mb-4 text-[var(--accent)]">Clinical Departments</p>
            <h1 className="font-display text-display-xl text-white mb-3 sm:mb-4">
              {departments.length} specialities,<br />
              <em className="not-italic" style={{ color: "var(--accent)" }}>one hospital.</em>
            </h1>
            <p className="text-white/75 text-base sm:text-lg">
              From emergency trauma care to specialised diagnostics — comprehensive, multi-specialty clinical care under one roof in Silchar.
            </p>
            </ScrollReveal>
        </div>
      </section>

      <section className="py-[var(--section-y)]" style={{ background: "var(--white)" }} aria-labelledby="depts-list-heading">
        <div className="container-site">
          <ScrollReveal className="mb-8">
            <h2 id="depts-list-heading" className="font-display text-display-md" style={{ color: "var(--primary-dark)" }}>All clinical departments</h2>
            <p className="text-sm mt-2" style={{ color: "var(--slate)" }}>Click any department to see its overview and common treatments.</p>
          </ScrollReveal>

          <StaggerReveal className="grid sm:grid-cols-2 gap-4">
            {departments.map((dept) => <DepartmentCard key={dept.id} dept={dept} />)}
          </StaggerReveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
