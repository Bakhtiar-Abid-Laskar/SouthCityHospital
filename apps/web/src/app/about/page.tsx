import type { Metadata } from "next";
import { Building2, ShieldCheck, Users, MapPin, Heart, Stethoscope } from "lucide-react";
import { hospital } from "@/data/hospital";
import { ScrollReveal, StaggerReveal, StaggerItem, staggerItemVariants, CountUp } from "@/components/ui/motion";
import { CtaBand } from "@/components/home/CtaBand";
import Image from "next/image";
import { FloatingBlobs, PulseLineWatermark } from "@/components/ui/svg-patterns";

export const metadata: Metadata = {
  title: "About Us — Healthcare Since 2006",
  description:
    "Serving Silchar and the Barak Valley since 2006, South City Hospital provides trusted multi-specialty clinical care and 24/7 emergency medical response.",
  alternates: {
    canonical: "https://southcityhospital.in/about",
  },
};

const coreValueIcons: Record<string, React.ElementType> = {
  "siren": ShieldCheck,
  "stethoscope": Stethoscope,
  "shield-check": ShieldCheck,
};

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section
        className="pt-12 pb-16 md:pt-16 md:pb-20 relative overflow-hidden bg-hero-gradient"
        aria-label="About page hero"
      >
        <FloatingBlobs />
        <PulseLineWatermark />
        <div className="container-site relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <ScrollReveal className="max-w-2xl">
              <p className="eyebrow text-white/60 mb-4 text-[var(--accent)]">About South City Hospital</p>
              <h1
                className="font-display text-white text-display-xl mb-5"
              >
                A legacy of care
                <br />
                <em className="not-italic" style={{ color: "var(--accent)" }}>since 2006.</em>
              </h1>
              <p className="text-white/75 text-lg leading-relaxed">
                {hospital.about}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2} className="relative aspect-[16/10] sm:aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl block mt-6 lg:mt-0">
              <Image
                src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=1200&auto=format&fit=crop"
                alt="South City Hospital interior facility"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-950)]/40 to-transparent pointer-events-none" aria-hidden="true" />
            </ScrollReveal>
          </div>

          {/* Stats integrated into hero as glass cards */}
          <StaggerReveal className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: Building2, value: hospital.established, label: "Year Established" },
              { icon: Users, value: hospital.stats.departments, label: "Clinical Departments" },
              { icon: ShieldCheck, value: hospital.stats.facilities, label: "Diagnostic Facilities" },
              { icon: Heart, value: hospital.stats.yearsOfService, label: "Years of Service" },
            ].map(({ icon: Icon, value, label }) => (
              <StaggerItem key={label} variants={staggerItemVariants} className="p-3.5 sm:p-5 rounded-2xl flex flex-col gap-1.5 sm:gap-2 backdrop-blur-md border" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
                <Icon size={18} style={{ color: "var(--accent)" }} aria-hidden="true" />
                <p className="font-mono font-bold text-2xl sm:text-3xl text-white mt-1">
                  <CountUp to={value} />{label === "Years of Service" ? "+" : ""}
                </p>
                <p className="text-[11px] sm:text-xs text-white/70 uppercase tracking-wider">{label}</p>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ── Managing Partner ── */}
      <section
        className="py-[var(--section-y)]"
        style={{ background: "var(--white)" }}
        aria-labelledby="partner-heading"
      >
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <ScrollReveal className="card p-6 sm:p-8 border border-[var(--mist)] flex flex-col items-center text-center gap-4 sm:gap-5">
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] mb-2">
                <div
                  className="relative w-60 h-60 sm:w-72 sm:h-72 rounded-full overflow-hidden"
                  style={{ background: "var(--primary-dark)" }}
                >
                  <Image
                    src="/nilava-mazumder.webp"
                    alt={`${hospital.managingPartner}, Managing Partner`}
                    fill
                    className="object-cover"
                    sizes="288px"
                  />
                </div>
              </div>
              <div>
                <h2 id="partner-heading" className="font-display font-semibold text-xl sm:text-2xl" style={{ color: "var(--blue-950)" }}>
                  {hospital.managingPartner}
                </h2>
                <p className="eyebrow mt-2 justify-center" style={{ color: "var(--primary)" }}>Managing Partner</p>
              </div>
              <div className="section-divider" />
              <p className="text-sm leading-relaxed" style={{ color: "var(--slate)" }}>
                Under the stewardship of {hospital.managingPartner}, South City Hospital has expanded from a specialized clinic into an 11-department clinical center serving thousands of families across the Barak Valley.
              </p>
            </ScrollReveal>

            <ScrollReveal
              variants={{ hidden: { opacity: 0, x: 32 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } } }}
              className="space-y-4"
            >
              <p className="eyebrow mb-2">Contact & Location</p>
              <h3 className="font-display text-display-sm" style={{ color: "var(--primary-dark)" }}>Find us in Silchar.</h3>
              <div className="space-y-2.5 text-sm" style={{ color: "var(--slate)" }}>
                <div className="flex gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} aria-hidden="true" />{hospital.location.address}</div>
                <div>OPD Hours: {hospital.opd.days}, {hospital.opd.hours}</div>
                <div>Emergency: <a href={`tel:${hospital.contact.emergency.replace(/\s/g,"")}`} className="font-semibold" style={{ color: "var(--primary)" }}>{hospital.contact.emergency}</a> (24/7)</div>
                <div>Email: <a href={`mailto:${hospital.contact.email}`} style={{ color: "var(--primary)" }}>{hospital.contact.email}</a></div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="py-[var(--section-y)]" style={{ background: "var(--white)" }} aria-labelledby="values-heading">
        <div className="container-site">
          <ScrollReveal className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <p className="eyebrow justify-center mb-2">Our Core Values</p>
            <h2 id="values-heading" className="font-display text-display-lg" style={{ color: "var(--primary-dark)" }}>
              What we stand for.
            </h2>
          </ScrollReveal>

          <StaggerReveal className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-6">
            {hospital.coreValues.map((v) => {
              const Icon = coreValueIcons[v.icon] || ShieldCheck;
              return (
                <StaggerItem key={v.id} variants={staggerItemVariants} className="card p-2.5 xs:p-3.5 sm:p-8 border border-[var(--mist)] text-center flex flex-col items-center gap-2 sm:gap-4 rounded-xl sm:rounded-2xl">
                  <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0 shadow-2xs" style={{ background: "var(--primary-light)" }}>
                    <Icon className="w-4 h-4 sm:w-7 sm:h-7" style={{ color: "var(--primary)" }} aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-bold sm:font-semibold text-xs sm:text-lg leading-tight" style={{ color: "var(--ink)" }}>{v.title}</h3>
                  <p className="text-[10px] xs:text-[11px] sm:text-sm leading-snug sm:leading-relaxed" style={{ color: "var(--slate)" }}>{v.description}</p>
                </StaggerItem>
              );
            })}
          </StaggerReveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
