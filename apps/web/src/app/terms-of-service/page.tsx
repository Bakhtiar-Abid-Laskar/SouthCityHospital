import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ChevronRight, AlertTriangle, Phone, Mail } from "lucide-react";
import { termsOfService } from "@/data/terms";
import { hospital } from "@/data/hospital";
import { ScrollReveal, StaggerReveal, StaggerItem, staggerItemVariants } from "@/components/ui/motion";
import { FloatingBlobs, PulseLineWatermark } from "@/components/ui/svg-patterns";
import { CtaBand } from "@/components/home/CtaBand";

export const metadata: Metadata = {
  title: "Terms of Service & Medical Disclaimer",
  description:
    "Terms of service, appointment cancellation rules, zero online payment policy, and emergency medical disclaimer for South City Hospital in Silchar, Assam.",
  alternates: {
    canonical: "https://southcityhospital.in/terms-of-service",
  },
};

export default function TermsOfServicePage() {
  return (
    <>
      {/* ── Hero Section ── */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-20 relative overflow-hidden bg-hero-gradient" aria-label="Terms of service hero">
        <FloatingBlobs />
        <PulseLineWatermark />
        <div className="container-site relative z-10">
          <ScrollReveal className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] mb-3">
              <Link href="/" className="hover:underline">Home</Link>
              <ChevronRight size={12} />
              <span>Terms of Service</span>
            </div>
            <h1 className="font-display text-display-xl text-white mb-4">
              Terms of Service &amp; <br />
              <em className="not-italic" style={{ color: "var(--accent)" }}>Medical Disclaimer.</em>
            </h1>
            <p className="text-white/75 text-lg leading-relaxed">
              Clear guidelines on website usage, appointment scheduling, consultation policies, and emergency care responsibilities.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="py-[var(--section-y)]" style={{ background: "var(--white)" }} aria-labelledby="terms-heading">
        <div className="container-site max-w-4xl space-y-8">
          {/* ── Prominent Emergency Disclaimer Callout ── */}
          <ScrollReveal className="card p-6 md:p-8 bg-red-50 border-2 border-red-300 rounded-2xl shadow-card text-red-950">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-red-100 text-red-700 shrink-0 mt-0.5">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-2">
                <h2 className="font-display font-bold text-lg text-red-900">
                  {termsOfService.emergencyDisclaimer.title}
                </h2>
                <p className="text-sm text-red-800 leading-relaxed">
                  {termsOfService.emergencyDisclaimer.message}
                </p>
                <div className="pt-2">
                  <a
                    href={`tel:${hospital.contact.emergency.replace(/\s/g, "")}`}
                    className="btn btn-emergency text-xs py-2 px-4 gap-2 inline-flex items-center"
                  >
                    <Phone size={14} />
                    <span>Call 24/7 Emergency: {hospital.contact.emergency}</span>
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Overview Card */}
          <ScrollReveal className="card p-6 md:p-8 bg-white border border-[var(--mist)] rounded-2xl shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--mist)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--sky-100)] text-[var(--primary)] flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 id="terms-heading" className="font-display font-bold text-lg text-[var(--navy-950)]">
                    {termsOfService.title}
                  </h2>
                  <p className="text-xs text-[var(--slate)]">Last Updated: {termsOfService.lastUpdated}</p>
                </div>
              </div>

              <span className="chip chip-diagnostic text-[11px] py-1 px-2.5 font-mono self-start sm:self-auto">
                Silchar Jurisdiction
              </span>
            </div>
          </ScrollReveal>

          {/* Terms Sections */}
          <StaggerReveal className="space-y-6">
            {termsOfService.sections.map((section) => (
              <StaggerItem
                key={section.id}
                variants={staggerItemVariants}
                className="card p-6 md:p-8 bg-white border border-[var(--mist)] rounded-2xl shadow-card space-y-4"
              >
                <h3 className="font-display font-semibold text-lg text-[var(--navy-950)] border-b border-[var(--mist)] pb-3">
                  {section.title}
                </h3>
                <div className="space-y-3 text-sm text-[var(--slate)] leading-relaxed">
                  {section.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>

          {/* Help & Contact Notice */}
          <ScrollReveal className="card p-6 bg-[var(--sky-100)]/60 border border-[var(--mist)] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-display font-semibold text-sm text-[var(--navy-950)]">Questions about our policies?</p>
              <p className="text-xs text-[var(--slate)] mt-0.5">Contact the hospital administration desk in Meherpur, Silchar.</p>
            </div>
            <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <a
                href={`tel:${hospital.contact.phone.replace(/\s/g, "")}`}
                className="btn btn-outline text-xs py-2 px-3 gap-1.5 w-full xs:w-auto justify-center min-h-[40px]"
              >
                <Phone size={14} />
                <span>{hospital.contact.phone}</span>
              </a>
              <a
                href={`mailto:${hospital.contact.email}`}
                className="btn btn-primary text-xs py-2 px-3 gap-1.5 w-full xs:w-auto justify-center min-h-[40px]"
              >
                <Mail size={14} />
                <span>Email Us</span>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
