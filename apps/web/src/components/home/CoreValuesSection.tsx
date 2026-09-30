"use client";

import { Siren, Stethoscope, ShieldCheck } from "lucide-react";
import { ScrollReveal, StaggerReveal, StaggerItem, staggerItemVariants } from "@/components/ui/motion";
import { hospital } from "@/data/hospital";

const iconMap: Record<string, React.ElementType> = {
  "siren": Siren,
  "stethoscope": Stethoscope,
  "shield-check": ShieldCheck,
};

export function CoreValuesSection() {
  return (
    <section
      aria-labelledby="values-heading"
      className="pt-10 pb-16 sm:pt-12 sm:pb-20"
      style={{ background: "var(--white)" }}
    >
      <div className="container-site">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <p className="eyebrow mb-2.5 justify-center">Our Foundation</p>
          <h2
            id="values-heading"
            className="font-display text-display-lg mb-3"
            style={{ color: "var(--primary-dark)" }}
          >
            What drives us
          </h2>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--slate)" }}>
            Three principles that have guided South City Hospital since 2006.
          </p>
        </ScrollReveal>

        <StaggerReveal className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-6">
          {hospital.coreValues.map((value, i) => {
            const Icon = iconMap[value.icon] || ShieldCheck;
            return (
              <StaggerItem
                key={value.id}
                variants={staggerItemVariants}
                className="card p-2.5 xs:p-3.5 sm:p-8 flex flex-col items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4 border border-[var(--mist)] rounded-xl sm:rounded-2xl"
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 xs:w-9 xs:h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ background: "var(--primary-light)" }}
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: "var(--primary)" }} />
                </div>

                <div>
                  <h3
                    className="font-display font-bold sm:font-semibold text-xs sm:text-lg mb-1 sm:mb-2 leading-tight"
                    style={{ color: "var(--ink)" }}
                  >
                    {value.title}
                  </h3>
                  <p className="text-[10px] xs:text-[11px] sm:text-sm leading-snug sm:leading-relaxed" style={{ color: "var(--slate)" }}>
                    {value.description}
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
