import type { Metadata } from "next";
import { Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { ScrollReveal, StaggerReveal, StaggerItem, staggerItemVariants } from "@/components/ui/motion";
import { CtaBand } from "@/components/home/CtaBand";
import { FloatingBlobs, PulseLineWatermark } from "@/components/ui/svg-patterns";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Patient Reviews & Testimonials",
  description:
    "Read genuine patient stories and clinical care reviews from families treated at South City Hospital in Silchar across emergency, surgical, and OPD services.",
  alternates: {
    canonical: "https://southcityhospital.in/testimonials",
  },
};

export default function TestimonialsPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-8 pb-10 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20 relative overflow-hidden bg-hero-gradient" aria-label="Testimonials hero">
        <FloatingBlobs />
        <PulseLineWatermark />
        <div className="container-site relative z-10">
          <ScrollReveal className="max-w-xl">
            <p className="eyebrow text-[var(--accent)] mb-3 sm:mb-4">Patient Experiences</p>
            <h1 className="font-display text-display-xl text-white mb-3 sm:mb-4">
              Real stories,<br />
              <em className="not-italic" style={{ color: "var(--accent)" }}>compassionate care.</em>
            </h1>
            <p className="text-white/75 text-base sm:text-lg">
              Hear from patients and families who trusted South City Hospital with their healthcare journeys in Silchar.
            </p>
            </ScrollReveal>
        </div>
      </section>

      {/* Testimonial Grid */}
      <section className="py-[var(--section-y)]" style={{ background: "var(--white)" }} aria-labelledby="testimonials-list-heading">
        <div className="container-site">
          <ScrollReveal className="mb-6 sm:mb-8">
            <h2 id="testimonials-list-heading" className="font-display text-display-md" style={{ color: "var(--primary-dark)" }}>
              What Our Patients Say
            </h2>
          </ScrollReveal>

          <StaggerReveal className="columns-1 md:columns-2 lg:columns-3 gap-5 sm:gap-6 space-y-5 sm:space-y-6">
            {testimonials.map((t, idx) => (
              <StaggerItem key={t.id} variants={staggerItemVariants} className="break-inside-avoid relative overflow-hidden card p-5 sm:p-8 border bg-white flex flex-col gap-5 sm:gap-6" style={{ borderColor: "rgba(208,213,221,0.5)" }}>
                {/* Quote Watermark */}
                <Quote size={120} className="absolute -top-6 -right-6 text-[var(--blue-50)] opacity-60 rotate-12" aria-hidden="true" />
                
                <blockquote className="relative z-10">
                  <Quote size={28} aria-hidden="true" className="mb-4" style={{ color: "var(--accent)" }} />
                  <p className="text-base leading-relaxed italic" style={{ color: "var(--navy-950)" }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>
                <div className="flex items-center gap-4 pt-4 border-t relative z-10 mt-auto" style={{ borderColor: "var(--mist)" }}>
                  {idx < 2 ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-sm border-[2px] border-[var(--cloud)]">
                      <Image
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"
                        alt={t.patientName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-white text-lg shrink-0 shadow-sm"
                      style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                      aria-hidden="true"
                    >
                      {t.patientName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--ink-900)" }}>{t.patientName}</p>
                    <span className="chip bg-[var(--accent-light)] text-[var(--primary-dark)] border-[var(--accent)]/20 text-[10px] mt-1">{t.department}</span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
