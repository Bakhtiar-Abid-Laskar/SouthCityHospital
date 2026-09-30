import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Stethoscope, Bone, Brain, Scissors, Microscope, Baby,
  Zap, Droplets, HeartPulse, ScanFace, ShieldCheck, Syringe, Dna,
  CalendarCheck, Phone, CheckCircle2, ChevronRight, ArrowRight,
  Clock, Activity, Sparkles, Building2, HelpCircle
} from "lucide-react";
import Image from "next/image";
import { getDoctorsByDepartment } from "@/lib/doctors";
import { departments } from "@/data/departments";
import { departmentDetails } from "@/data/department-details";
import { hospital } from "@/data/hospital";
import { FloatingBlobs, PulseLineWatermark } from "@/components/ui/svg-patterns";
import { CtaBand } from "@/components/home/CtaBand";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const iconMap: Record<string, React.ElementType> = {
  Stethoscope, Bone, Brain, Scissors, Microscope, Baby,
  Zap, Droplets, HeartPulse, ScanFace, ShieldCheck, Syringe, Dna
};

export async function generateStaticParams() {
  return departments.map((dept) => ({
    slug: dept.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dept = departments.find((d) => d.slug === slug);
  const details = departmentDetails[slug];

  if (!dept || !details) {
    return {
      title: "Department Not Found",
    };
  }

  return {
    title: details.metaTitle,
    description: details.metaDescription,
    alternates: {
      canonical: `https://southcityhospital.in/departments/${slug}`,
    },
    openGraph: {
      title: `${details.metaTitle} | South City Hospital`,
      description: details.metaDescription,
      url: `https://southcityhospital.in/departments/${slug}`,
      siteName: "South City Hospital",
      locale: "en_IN",
      type: "website",
    },
  };
}

export default async function DepartmentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const dept = departments.find((d) => d.slug === slug);
  const details = departmentDetails[slug];

  if (!dept || !details) {
    notFound();
  }

  const Icon = iconMap[dept.icon] || Stethoscope;
  const otherDepartments = departments.filter((d) => d.slug !== slug).slice(0, 4);
  const deptDoctors = await getDoctorsByDepartment(slug);

  return (
    <>
      {/* ── Breadcrumbs Bar ── */}
      <nav aria-label="Breadcrumb" className="bg-[var(--cloud)] border-b border-[var(--mist)] py-3">
        <div className="container-site">
          <ol className="flex items-center flex-wrap gap-2 text-xs text-[var(--slate)] font-medium">
            <li>
              <Link href="/" className="hover:text-[var(--primary)] transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} className="text-[var(--mist-dark,rgba(0,0,0,0.3))]" />
            </li>
            <li>
              <Link href="/departments" className="hover:text-[var(--primary)] transition-colors">
                Departments
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} className="text-[var(--mist-dark,rgba(0,0,0,0.3))]" />
            </li>
            <li aria-current="page" className="text-[var(--navy-950)] font-semibold truncate max-w-[200px] sm:max-w-none">
              {dept.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="pt-8 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20 relative overflow-hidden bg-hero-gradient" aria-label={`${dept.name} hero`}>
        <FloatingBlobs />
        <PulseLineWatermark />
        <div className="container-site relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-white text-xs font-semibold mb-4 sm:mb-5">
              <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--navy-950)] flex items-center justify-center shrink-0">
                <Icon size={13} aria-hidden="true" />
              </div>
              <span>Clinical Specialty · Silchar</span>
            </div>

            <h1 className="font-display text-display-xl text-white mb-3 sm:mb-4">
              {dept.name} <span style={{ color: "var(--accent)" }}>Department</span>
            </h1>

            <p className="text-white/85 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed max-w-2xl">
              {details.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href={`/doctors?department=${dept.slug}`}
                className="btn btn-primary gap-2 text-sm shadow-md"
              >
                <CalendarCheck size={16} aria-hidden="true" />
                <span>Consult Our Specialists</span>
              </Link>
              <a
                href={`tel:${hospital.contact.emergency.replace(/\s/g, "")}`}
                className="btn btn-emergency gap-2 text-sm"
              >
                <Phone size={16} aria-hidden="true" />
                <span>24/7 Helpline: {hospital.contact.emergency}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Highlights Banner ── */}
      <section className="border-b border-[var(--mist)] bg-white py-5 shadow-xs" aria-label="Department highlights">
        <div className="container-site">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-[var(--sky-100)] text-[var(--primary)] flex items-center justify-center shrink-0">
                <Clock size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--navy-950)]">24/7 Emergency Care</p>
                <p className="text-[11px] text-[var(--slate)]">Continuous on-call response</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-[var(--teal-400)]/10 text-[var(--teal-600)] flex items-center justify-center shrink-0">
                <Sparkles size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--navy-950)]">Modern Technology</p>
                <p className="text-[11px] text-[var(--slate)]">Advanced diagnostic tools</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-[var(--blue-100)] text-[var(--blue-700)] flex items-center justify-center shrink-0">
                <Activity size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--navy-950)]">Expert Clinicians</p>
                <p className="text-[11px] text-[var(--slate)]">Decades of medical expertise</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-[var(--coral-600)]/10 text-[var(--coral-600)] flex items-center justify-center shrink-0">
                <Building2 size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--navy-950)]">Inpatient & ICU Support</p>
                <p className="text-[11px] text-[var(--slate)]">Dedicated step-down beds</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <section className="py-12 sm:py-16 md:py-20 bg-white" aria-label="Department details">
        <div className="container-site">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
            
            {/* Left 2 Cols: Substantive clinical content */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* 1. Overview */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                  <p className="eyebrow text-[var(--primary)]">Clinical Overview</p>
                </div>
                <h2 className="font-display text-display-sm text-[var(--navy-950)] mb-4">
                  About {dept.name} at South City Hospital
                </h2>
                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[var(--slate)]">
                  {details.overviewParagraphs.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* 2. Key Specializations */}
              <div className="pt-6 border-t border-[var(--mist)]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                  <p className="eyebrow text-[var(--primary-dark)]">Specialized Areas</p>
                </div>
                <h2 className="font-display text-display-sm text-[var(--navy-950)] mb-6">
                  Key Clinical Focus & Specializations
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {details.keySpecializations.map((spec, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-[var(--mist)] bg-[var(--cloud)]/40 hover:bg-white hover:border-[var(--primary)]/40 transition-all shadow-xs"
                    >
                      <h3 className="font-display font-semibold text-base text-[var(--navy-950)] mb-2">
                        {spec.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--slate)] leading-relaxed">
                        {spec.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Common Procedures & Treatments */}
              <div className="pt-6 border-t border-[var(--mist)]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--teal-400)]" aria-hidden="true" />
                  <p className="eyebrow text-[var(--primary-dark)]">Treatments & Procedures</p>
                </div>
                <h2 className="font-display text-display-sm text-[var(--navy-950)] mb-6">
                  Procedures & Clinical Interventions
                </h2>
                <div className="space-y-3">
                  {details.procedures.map((proc, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-[var(--mist)] bg-white flex items-start gap-3.5 shadow-xs"
                    >
                      <CheckCircle2 size={18} className="text-[var(--accent)] shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <h3 className="font-display font-semibold text-sm sm:text-base text-[var(--navy-950)] mb-1">
                          {proc.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-[var(--slate)] leading-relaxed">
                          {proc.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3.5. Department Doctors / Faculty */}
              {deptDoctors.length > 0 && (
                <div className="pt-6 border-t border-[var(--mist)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Stethoscope size={16} className="text-[var(--primary)]" aria-hidden="true" />
                    <p className="eyebrow text-[var(--primary)]">Specialist Faculty</p>
                  </div>
                  <h2 className="font-display text-display-sm text-[var(--navy-950)] mb-4">
                    Specialist Doctors in {dept.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--slate)] mb-6">
                    Consult leading {dept.name.toLowerCase()} specialists at South City Hospital, Silchar. View detailed qualifications, consultation schedules, and book appointments.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {deptDoctors.map((doc) => {
                      const displayName = doc.name.startsWith("Dr.") ? doc.name : `Dr. ${doc.name}`;
                      return (
                        <Link
                          key={doc.id}
                          href={`/doctors/${doc.slug}`}
                          className="p-4 rounded-xl border border-[var(--mist)] bg-white hover:border-[var(--primary)] hover:shadow-xs transition-all flex items-center gap-3.5 group"
                          title={`View profile of ${displayName} – ${dept.name} in Silchar`}
                        >
                          <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 bg-[var(--primary-dark)] border border-[var(--mist)]">
                            {doc.photoUrl ? (
                              <Image
                                src={doc.photoUrl}
                                alt={`${displayName}, ${dept.name} at South City Hospital, Silchar`}
                                width={56}
                                height={56}
                                sizes="56px"
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--accent)] bg-[var(--navy-950)]">
                                <Stethoscope size={24} aria-hidden="true" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-[var(--navy-950)] group-hover:text-[var(--primary)] transition-colors truncate">
                              {displayName}
                            </p>
                            <p className="text-xs text-[var(--slate)] truncate">
                              {doc.qualifications.join(", ")}
                            </p>
                            {doc.experienceYears > 0 && (
                              <p className="text-[11px] font-medium text-[var(--primary)] mt-0.5">
                                {doc.experienceYears}+ years experience
                              </p>
                            )}
                          </div>
                          <ChevronRight size={16} className="text-[var(--slate)]/40 group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. When to Consult */}
              <div className="pt-6 border-t border-[var(--mist)]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--coral-600)]" aria-hidden="true" />
                  <p className="eyebrow text-[var(--coral-600)]">Patient Guidance</p>
                </div>
                <h2 className="font-display text-display-sm text-[var(--navy-950)] mb-4">
                  When Should You Consult Our Specialists?
                </h2>
                <div className="p-5 sm:p-6 rounded-2xl bg-[var(--coral-600)]/5 border border-[var(--coral-600)]/20">
                  <p className="text-xs sm:text-sm text-[var(--ink)] font-medium mb-3">
                    We recommend scheduling an evaluation or visiting our emergency department if you experience:
                  </p>
                  <ul className="space-y-2.5">
                    {details.whenToConsult.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--slate)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--coral-600)] mt-2 shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 5. Department FAQs */}
              <div className="pt-6 border-t border-[var(--mist)]">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle size={16} className="text-[var(--primary)]" aria-hidden="true" />
                  <p className="eyebrow text-[var(--primary)]">Frequently Asked Questions</p>
                </div>
                <h2 className="font-display text-display-sm text-[var(--navy-950)] mb-6">
                  Common Questions About {dept.name}
                </h2>
                <div className="space-y-4">
                  {details.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-[var(--mist)] bg-white shadow-xs"
                    >
                      <h3 className="font-display font-semibold text-sm sm:text-base text-[var(--navy-950)] mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--slate)] leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Col: Consultation Card, Facilities, Contact Box */}
            <div className="space-y-6">
              
              {/* Doctor Appointment Card */}
              <div className="card p-6 border border-[var(--mist)] bg-gradient-to-b from-white to-[var(--cloud)]/50 shadow-sm rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-[var(--sky-100)] text-[var(--blue-700)] flex items-center justify-center mb-4">
                  <Icon size={24} aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-lg text-[var(--navy-950)] mb-1.5">
                  Book a Consultation
                </h3>
                <p className="text-xs sm:text-sm text-[var(--slate)] mb-5 leading-relaxed">
                  Consult with our specialist physicians and surgeons. Both routine outpatient appointments and priority consultations are available.
                </p>
                <div className="space-y-3">
                  <Link
                    href={`/doctors?department=${dept.slug}`}
                    className="btn btn-primary w-full justify-center gap-2 text-xs py-3"
                  >
                    <CalendarCheck size={16} aria-hidden="true" />
                    <span>View Specialist Schedules</span>
                  </Link>
                  <a
                    href={`tel:${hospital.contact.phone.replace(/\s/g, "")}`}
                    className="btn btn-outline w-full justify-center gap-2 text-xs py-3 bg-white"
                  >
                    <Phone size={16} aria-hidden="true" />
                    <span>Call Desk: {hospital.contact.phone}</span>
                  </a>
                </div>
                <div className="mt-5 pt-4 border-t border-[var(--mist)] text-[11px] text-[var(--slate)]">
                  <p className="font-semibold text-[var(--navy-950)] mb-0.5">OPD Timings:</p>
                  <p>{hospital.opd.days}: {hospital.opd.hours}</p>
                </div>
              </div>

              {/* Supporting Hospital Infrastructure */}
              <div className="card p-6 border border-[var(--mist)] bg-white shadow-xs rounded-2xl">
                <h3 className="font-display font-bold text-base text-[var(--navy-950)] mb-3">
                  Department Infrastructure
                </h3>
                <ul className="space-y-3">
                  {details.facilitiesAndTech.map((fac, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[var(--slate)] leading-snug">
                      <CheckCircle2 size={15} className="text-[var(--primary)] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{fac}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-4 border-t border-[var(--mist)]">
                  <Link
                    href="/facilities"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
                  >
                    <span>View all hospital facilities</span>
                    <ArrowRight size={13} aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Emergency Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--navy-950)] to-[var(--blue-900)] text-white shadow-sm">
                <p className="text-[11px] uppercase tracking-wider text-[var(--accent)] font-bold mb-1">
                  24/7 Emergency Services
                </p>
                <h4 className="font-display font-semibold text-base mb-2">
                  Immediate Trauma & Medical Care
                </h4>
                <p className="text-xs text-white/80 mb-4 leading-relaxed">
                  Our emergency resuscitation team and ambulances are ready around the clock.
                </p>
                <a
                  href={`tel:${hospital.contact.emergency.replace(/\s/g, "")}`}
                  className="btn btn-emergency w-full justify-center text-xs py-2.5 gap-2"
                >
                  <Phone size={15} aria-hidden="true" />
                  <span>Call {hospital.contact.emergency}</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── Related Departments Navigation ── */}
      <section className="py-12 bg-[var(--cloud)] border-t border-[var(--mist)]" aria-label="Explore other departments">
        <div className="container-site">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="eyebrow text-[var(--primary)] mb-1">Explore More</p>
              <h2 className="font-display text-display-sm text-[var(--navy-950)]">
                Other Clinical Specialties
              </h2>
            </div>
            <Link
              href="/departments"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
            >
              <span>View all 13 departments</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherDepartments.map((otherDept) => {
              const OtherIcon = iconMap[otherDept.icon] || Stethoscope;
              return (
                <Link
                  key={otherDept.slug}
                  href={`/departments/${otherDept.slug}`}
                  className="card p-5 bg-white border border-[var(--mist)] hover:border-[var(--primary)]/40 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[var(--sky-100)] text-[var(--blue-700)] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <OtherIcon size={20} aria-hidden="true" />
                    </div>
                    <h3 className="font-display font-semibold text-base text-[var(--navy-950)] group-hover:text-[var(--primary)] transition-colors mb-1.5">
                      {otherDept.name}
                    </h3>
                    <p className="text-xs text-[var(--slate)] line-clamp-2 leading-relaxed">
                      {otherDept.shortDescription}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--mist)]/60 flex items-center justify-between text-xs font-semibold text-[var(--primary)]">
                    <span>Learn more</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Call To Action Band ── */}
      <CtaBand />
    </>
  );
}
