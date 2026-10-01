import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarCheck,
  MapPin,
  Phone,
  Clock,
  Award,
  GraduationCap,
  Languages,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Stethoscope,
  Building2,
  BadgeCheck,
} from "lucide-react";
import {
  getAllPublishedDoctors,
  getDoctorBySlug,
  getRelatedDoctors,
  getDoctorFallbackBio,
  isValidRegistrationNumber,
} from "@/lib/doctors";
import { departments } from "@/data/departments";
import { departmentDetails } from "@/data/department-details";
import { hospital, SITE_URL } from "@/data/hospital";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildPhysicianSchema,
  buildBreadcrumbSchema,
  buildDoctorFaqSchema,
  getAuthoritativeDoctorFaqs,
} from "@/lib/doctor-schema";
import { DoctorProfileBookingAction } from "@/components/doctor/DoctorProfileBookingAction";

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[var(--navy-950)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-[var(--navy-950)]">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

function renderFormattedBio(bio: string) {
  const paragraphs = bio.split(/\n\s*\n/).filter(Boolean);

  return paragraphs.map((p, pIdx) => {
    const lines = p.split("\n").map((l) => l.trim()).filter(Boolean);
    const isList = lines.every((l) => l.startsWith("- ") || l.startsWith("• ") || l.startsWith("* "));

    if (isList) {
      return (
        <ul key={pIdx} className="space-y-2 my-3 pl-1">
          {lines.map((line, lIdx) => {
            const clean = line.replace(/^[-•*]\s+/, "");
            return (
              <li key={lIdx} className="flex items-start gap-2.5 text-sm text-[var(--slate)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0 mt-2" aria-hidden="true" />
                <span>{renderInlineMarkdown(clean)}</span>
              </li>
            );
          })}
        </ul>
      );
    }

    if (p.startsWith("### ")) {
      return (
        <h3 key={pIdx} className="font-display font-semibold text-lg text-[var(--navy-950)] mt-5 mb-2">
          {p.replace(/^###\s+/, "")}
        </h3>
      );
    }

    return (
      <p key={pIdx} className="text-[var(--slate)] leading-relaxed text-sm sm:text-base">
        {renderInlineMarkdown(p)}
      </p>
    );
  });
}

export const revalidate = 3600; // 1 hour ISR
export const dynamicParams = true; // Allow newly published doctors without redeploy

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const doctors = await getAllPublishedDoctors();
  return doctors.map((d) => ({
    slug: d.slug!,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);

  if (!doctor || doctor.active === false) {
    return {
      title: "Doctor Profile | South City Hospital, Silchar",
      robots: { index: false, follow: false },
    };
  }

  const dept = departments.find((d) => d.slug === doctor.departmentSlug);
  const specialty = dept ? dept.name : "Specialist";
  const cleanName = doctor.name.replace(/\s+/g, " ").trim();
  const rawName = cleanName.replace(/^Dr\.\s*/i, "");
  const displayName = cleanName.startsWith("Dr.") ? cleanName : `Dr. ${cleanName}`;

  // Title: under ~60 characters where possible, front-loaded doctor name for maximum Google ranking
  const title = doctor.seoTitle || `${displayName} – ${specialty} in Silchar | South City Hospital`;

  // Description: 140-160 characters
  const expSnippet = doctor.experienceYears > 0 ? `${doctor.experienceYears}+ years experience` : "clinical expertise";
  const daysSnippet =
    doctor.consultationSchedule && doctor.consultationSchedule.length > 0
      ? `Consultation: ${doctor.consultationSchedule[0].day}. `
      : "";
  const defaultDesc = `Consult ${displayName}, experienced ${specialty} specialist with ${expSnippet} at South City Hospital, Meherpur, Silchar. ${daysSnippet}Book chamber appointment online.`;
  const description = (doctor.seoDescription || defaultDesc).slice(0, 160);

  const canonicalUrl = `${SITE_URL}/doctors/${doctor.slug}`;

  // Split name for OpenGraph profile tags
  const nameParts = rawName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    title,
    description,
    keywords: [
      displayName,
      rawName,
      `${displayName} Silchar`,
      `${rawName} Silchar`,
      `${displayName} South City Hospital`,
      `${displayName} chamber timings Silchar`,
      `${displayName} appointment Silchar`,
      `${rawName} doctor Silchar`,
      `${rawName} chamber Silchar`,
      `${specialty} doctor Silchar`,
      `Best ${specialty.toLowerCase()} in Silchar`,
      "South City Hospital Silchar doctors",
      "Doctor chamber Meherpur Silchar",
      "Silchar hospital OPD schedule",
      "Barak Valley medical specialist",
      "Assam doctor appointment",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "profile",
      siteName: `${hospital.name}, Silchar`,
      locale: "en_IN",
      firstName,
      lastName,
      username: doctor.slug,
      images: [
        {
          url: doctor.photoUrl || `${SITE_URL}/og-image.jpg`,
          width: 800,
          height: 800,
          alt: `${displayName}, ${specialty} at South City Hospital, Silchar, Assam`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [doctor.photoUrl || `${SITE_URL}/og-image.jpg`],
    },
    other: {
      "geo.region": "IN-AS",
      "geo.placename": "Silchar, Cachar, Assam",
      "geo.position": `${hospital.location.geo.latitude};${hospital.location.geo.longitude}`,
      "ICBM": `${hospital.location.geo.latitude}, ${hospital.location.geo.longitude}`,
      "DC.title": title,
      "DC.creator": `${hospital.name}, Silchar`,
      "DC.coverage": "Silchar, Cachar, Barak Valley, Assam, India",
      "target-location": "Silchar, Assam, India",
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export default async function DoctorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);

  if (!doctor || doctor.active === false) {
    notFound();
  }

  const dept = departments.find((d) => d.slug === doctor.departmentSlug);
  const deptDetails = departmentDetails[doctor.departmentSlug];
  const specialtyName = dept ? dept.name : "Specialist";
  const cleanName = doctor.name.replace(/\s+/g, " ").trim();
  const displayName = cleanName.startsWith("Dr.") ? cleanName : `Dr. ${cleanName}`;
  const canonicalUrl = `${SITE_URL}/doctors/${doctor.slug}`;

  // Bio resolution
  const bioText = (doctor.biography || doctor.bio || "").trim() || getDoctorFallbackBio(doctor, specialtyName);

  // Areas of expertise / conditions treated
  let expertiseList = doctor.expertise && doctor.expertise.length > 0 ? doctor.expertise : [];
  if (expertiseList.length === 0 && deptDetails?.keySpecializations) {
    expertiseList = deptDetails.keySpecializations.map((k) => k.title);
  }

  // Related doctors in same department
  const relatedDoctors = await getRelatedDoctors(doctor, 3);

  // Schema generation
  const physicianSchema = buildPhysicianSchema(doctor, specialtyName, canonicalUrl, bioText);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Doctors", url: `${SITE_URL}/doctors` },
    { name: specialtyName, url: `${SITE_URL}/departments/${doctor.departmentSlug}` },
    { name: displayName, url: canonicalUrl },
  ]);

  // Authoritative AI-grounded FAQs (Guarantees 5 high-converting Q&As for Google & AI Engines)
  const authoritativeFaqs = getAuthoritativeDoctorFaqs(doctor, specialtyName);
  const faqSchema = buildDoctorFaqSchema(authoritativeFaqs);

  const hasValidReg = isValidRegistrationNumber(doctor.registrationNumber);

  return (
    <>
      {/* ── Structured Data (JSON-LD) ── */}
      <JsonLd data={physicianSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* ── Breadcrumb Navigation ── */}
      <nav aria-label="Breadcrumbs" className="bg-[var(--cloud)] border-b border-[var(--mist)] py-3">
        <div className="container-site">
          <ol className="flex items-center flex-wrap gap-2 text-xs text-[var(--slate)] font-medium">
            <li>
              <Link href="/" className="hover:text-[var(--primary)] transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} className="text-[var(--slate)]/40" />
            </li>
            <li>
              <Link href="/doctors" className="hover:text-[var(--primary)] transition-colors">
                Doctors
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} className="text-[var(--slate)]/40" />
            </li>
            <li>
              <Link
                href={`/departments/${doctor.departmentSlug}`}
                className="hover:text-[var(--primary)] transition-colors"
              >
                {specialtyName}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} className="text-[var(--slate)]/40" />
            </li>
            <li aria-current="page" className="text-[var(--navy-950)] font-semibold truncate max-w-[220px] sm:max-w-none">
              {displayName}
            </li>
          </ol>
        </div>
      </nav>

      {/* ── Doctor Hero Profile ── */}
      <section className="py-10 sm:py-14 bg-gradient-to-b from-[var(--cloud)] to-white border-b border-[var(--mist)]" aria-labelledby="doctor-hero-heading">
        <div className="container-site">
          <div className="grid md:grid-cols-12 gap-8 sm:gap-10 items-start">
            
            {/* Left: Doctor Photo */}
            <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="relative p-1.5 rounded-3xl bg-gradient-to-tr from-[var(--navy-950)] via-[var(--primary)] to-[var(--accent)] shadow-xl mb-4">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden bg-[var(--primary-dark)]">
                  {doctor.photoUrl ? (
                    <Image
                      src={doctor.photoUrl}
                      alt={`${displayName}, ${specialtyName} at South City Hospital, Silchar`}
                      width={224}
                      height={224}
                      priority={true}
                      sizes="(max-width: 640px) 192px, 224px"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--accent)] bg-[var(--navy-950)]">
                      <Stethoscope size={64} aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 z-20 bg-white rounded-full p-1.5 shadow-md">
                  <BadgeCheck size={28} style={{ color: "var(--accent)", fill: "var(--navy-950)" }} aria-hidden="true" />
                </div>
              </div>

              {/* Department badge with internal link */}
              <Link
                href={`/departments/${doctor.departmentSlug}`}
                className="chip chip-diagnostic text-xs py-1 px-3 mb-2 hover:bg-[var(--primary)] hover:text-white transition-colors flex items-center gap-1.5"
                title={`View all ${specialtyName} services at South City Hospital`}
              >
                <Building2 size={13} aria-hidden="true" />
                <span>{specialtyName}</span>
              </Link>

              {/* Hospital affiliation verification */}
              <p className="text-[11px] text-[var(--slate)] font-medium flex items-center gap-1 mt-1">
                <span>Verified Specialist at South City Hospital</span>
              </p>
            </div>

            {/* Right: Key Credentials & Booking Header */}
            <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between">
              <div>
                <p className="eyebrow text-[var(--primary)] mb-2">Specialist Consultant</p>

                {/* Exactly ONE H1 for On-Page SEO */}
                <h1
                  id="doctor-hero-heading"
                  className="font-display text-display-md text-[var(--navy-950)] mb-3 leading-tight"
                >
                  {displayName} – {specialtyName} in Silchar
                </h1>

                {/* Qualifications */}
                {doctor.qualifications && doctor.qualifications.length > 0 && (
                  <p className="text-base sm:text-lg font-medium text-[var(--slate)] mb-4">
                    {doctor.qualifications.join(", ")}
                  </p>
                )}

                {/* Credentials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6 text-sm">
                  {/* Experience */}
                  {doctor.experienceYears > 0 && (
                    <div className="p-3 rounded-xl bg-white border border-[var(--mist)] shadow-xs flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[var(--blue-50)] text-[var(--primary)] shrink-0">
                        <Award size={18} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[11px] text-[var(--slate)] uppercase tracking-wider font-semibold">Experience</p>
                        <p className="font-semibold text-[var(--navy-950)]">{doctor.experienceYears}+ Years Clinical</p>
                      </div>
                    </div>
                  )}

                  {/* Registration Number (ONLY rendered if valid) */}
                  {hasValidReg && (
                    <div className="p-3 rounded-xl bg-white border border-[var(--mist)] shadow-xs flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[var(--blue-50)] text-[var(--primary)] shrink-0">
                        <GraduationCap size={18} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[11px] text-[var(--slate)] uppercase tracking-wider font-semibold">Medical Reg. No.</p>
                        <p className="font-semibold text-[var(--navy-950)]">{doctor.registrationNumber.trim()}</p>
                      </div>
                    </div>
                  )}

                  {/* Spoken Languages */}
                  {doctor.languages && doctor.languages.length > 0 && (
                    <div className="p-3 rounded-xl bg-white border border-[var(--mist)] shadow-xs flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[var(--blue-50)] text-[var(--primary)] shrink-0">
                        <Languages size={18} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[11px] text-[var(--slate)] uppercase tracking-wider font-semibold">Languages</p>
                        <p className="font-semibold text-[var(--navy-950)]">{doctor.languages.join(", ")}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Band */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 border-t border-[var(--mist)]">
                <DoctorProfileBookingAction doctor={doctor} size="large" />

                <a
                  href={`tel:${hospital.contact.emergency.replace(/\s/g, "")}`}
                  className="btn btn-outline gap-2 text-sm py-3 px-5 border-[var(--mist)] hover:bg-[var(--cloud)] transition-colors justify-center"
                >
                  <Phone size={16} aria-hidden="true" className="text-[var(--primary)]" />
                  <span>Call Hospital: {hospital.contact.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Profile Content Layout ── */}
      <section className="py-12 sm:py-16 bg-white" aria-label="Doctor profile details">
        <div className="container-site">
          <div className="grid lg:grid-cols-12 gap-10">

            {/* Left Column (8 cols): Bio, Expertise, Schedule */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* About / Bio Section */}
              <article>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-6 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                  <h2 className="font-display text-2xl font-bold text-[var(--navy-950)]">
                    About {displayName}
                  </h2>
                </div>
                <div className="prose prose-slate max-w-none text-[var(--slate)] leading-relaxed space-y-4">
                  {renderFormattedBio(bioText)}
                  <p className="text-sm pt-2 border-t border-[var(--mist)]/40">
                    Consultations are conducted at South City Hospital in Meherpur, Silchar, supported by fully equipped on-site diagnostic testing, digital imaging, and 24-hour critical emergency care.
                  </p>
                </div>
              </article>

              {/* Areas of Expertise / Conditions Treated */}
              {expertiseList.length > 0 && (
                <section aria-labelledby="expertise-heading">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-6 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                    <h2 id="expertise-heading" className="font-display text-2xl font-bold text-[var(--navy-950)]">
                      Areas of Expertise &amp; Conditions Treated
                    </h2>
                  </div>
                  <p className="text-sm text-[var(--slate)] mb-6">
                    {displayName} provides evidence-based medical interventions for a wide spectrum of health concerns in {specialtyName.toLowerCase()}:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3.5">
                    {expertiseList.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--cloud)]/60 border border-[var(--mist)] text-sm text-[var(--navy-950)]"
                      >
                        <CheckCircle2 size={18} className="text-[var(--primary)] shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education & Qualifications */}
              {doctor.education && doctor.education.length > 0 && (
                <section aria-labelledby="education-heading">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-6 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                    <h2 id="education-heading" className="font-display text-2xl font-bold text-[var(--navy-950)]">
                      Education &amp; Academic Background
                    </h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3.5">
                    {doctor.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[var(--cloud)] border border-[var(--mist)] text-sm space-y-1"
                      >
                        <p className="font-bold text-[var(--navy-950)]">{edu.degree}</p>
                        <p className="text-xs text-[var(--slate)]">{edu.institution}</p>
                        {edu.year && (
                          <p className="text-[11px] font-mono text-[var(--primary)] font-semibold">
                            {edu.year}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Frequently Asked Questions (Indexed by Google & AI Search) */}
              <section aria-labelledby="faq-heading">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-6 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                  <h2 id="faq-heading" className="font-display text-2xl font-bold text-[var(--navy-950)]">
                    Frequently Asked Questions about {displayName}
                  </h2>
                </div>
                <p className="text-xs text-[var(--slate)] mb-5">
                  Authoritative answers regarding chamber availability, OPD consultation schedules, and hospital location in Silchar, Assam.
                </p>
                <div className="space-y-3.5">
                  {authoritativeFaqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-[var(--mist)] space-y-2 shadow-xs hover:border-[var(--primary)]/30 transition-all"
                    >
                      <h3 className="font-semibold text-sm sm:text-base text-[var(--navy-950)] flex items-start gap-2.5">
                        <span className="text-[var(--primary)] font-bold shrink-0">Q:</span>
                        <span>{faq.question}</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--slate)] leading-relaxed pl-5 sm:pl-6">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Consultation Hours & Schedule Table */}
              <section aria-labelledby="schedule-heading">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-6 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                  <h2 id="schedule-heading" className="font-display text-2xl font-bold text-[var(--navy-950)]">
                    Consultation Hours &amp; OPD Schedule
                  </h2>
                </div>
                <p className="text-sm text-[var(--slate)] mb-6">
                  Weekly outpatient appointment slots at South City Hospital, Silchar. Bookings can be scheduled online or confirmed at hospital reception.
                </p>

                {doctor.consultationSchedule && doctor.consultationSchedule.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-[var(--mist)] shadow-xs">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[var(--cloud)] text-[var(--navy-950)] font-semibold border-b border-[var(--mist)]">
                        <tr>
                          <th scope="col" className="py-3.5 px-5">Consultation Days</th>
                          <th scope="col" className="py-3.5 px-5">Timings</th>
                          <th scope="col" className="py-3.5 px-5">Location</th>
                          <th scope="col" className="py-3.5 px-5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--mist)] text-[var(--slate)]">
                        {doctor.consultationSchedule.map((slot, idx) => (
                          <tr key={idx} className="hover:bg-white/60 transition-colors">
                            <td className="py-4 px-5 font-semibold text-[var(--navy-950)]">
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-[var(--primary)] shrink-0" aria-hidden="true" />
                                <span>{slot.day}</span>
                              </div>
                            </td>
                            <td className="py-4 px-5 font-mono text-xs">
                              {slot.startTime} – {slot.endTime}
                            </td>
                            <td className="py-4 px-5 text-xs text-[var(--slate)]">
                              South City Hospital OPD
                            </td>
                            <td className="py-4 px-5 text-right">
                              <DoctorProfileBookingAction doctor={doctor} buttonClassName="text-xs py-1.5 px-3" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[var(--cloud)] border border-[var(--mist)] text-sm text-[var(--slate)] text-center">
                    <p>Consultation schedules are subject to clinical rotations.</p>
                    <p className="mt-1 font-medium text-[var(--primary)]">Please call reception directly at {hospital.contact.phone} for today’s OPD availability.</p>
                  </div>
                )}
              </section>

              {/* Department Overview Link */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[var(--blue-50)] to-[var(--cloud)] border border-[var(--mist)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-[var(--navy-950)]">
                    Explore the {specialtyName} Department
                  </h3>
                  <p className="text-xs text-[var(--slate)] mt-1">
                    Discover clinical facilities, diagnostic technologies, and treatment procedures available at South City Hospital.
                  </p>
                </div>
                <Link
                  href={`/departments/${doctor.departmentSlug}`}
                  className="btn btn-outline shrink-0 gap-2 text-xs py-2 px-4 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all"
                >
                  <span>View Department</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Right Column (4 cols): Hospital Location, Emergency, Related Doctors */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Hospital Location & Emergency Block (Geo NAP Grounding) */}
              <div className="p-6 rounded-2xl bg-[var(--cloud)] border border-[var(--mist)] shadow-xs space-y-5">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-[var(--primary)]" aria-hidden="true" />
                  <h3 className="font-display font-bold text-lg text-[var(--navy-950)]">
                    Chamber &amp; Practice Location
                  </h3>
                </div>

                <div className="space-y-2 text-sm text-[var(--slate)]">
                  <p className="font-bold text-[var(--navy-950)]">South City Hospital, Silchar</p>
                  <p className="text-xs text-[var(--slate)] leading-relaxed">
                    Meherpur, Silchar, Cachar, Assam – 788015, India
                  </p>
                  <p className="text-[11px] text-[var(--slate)]/80 leading-snug">
                    Situated on Silchar–Hailakandi Road. Accessible for patients traveling from Cachar, Hailakandi, Karimganj, and Barak Valley.
                  </p>
                </div>

                <a
                  href="https://www.google.com/maps/place/South+City+Hospital/@24.785576,92.7955732,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline w-full text-xs py-2.5 px-3 gap-1.5 border-[var(--mist)] hover:border-[var(--primary)] bg-white text-[var(--navy-950)] hover:text-[var(--primary)] transition-colors flex items-center justify-center font-medium"
                >
                  <MapPin size={14} className="text-[var(--primary)]" />
                  <span>View on Google Maps (Directions)</span>
                </a>

                <div className="p-4 rounded-xl bg-white border border-[var(--mist)] space-y-2">
                  <div className="flex items-center gap-2 text-[var(--emergency)] font-semibold text-xs uppercase tracking-wide">
                    <ShieldAlert size={16} aria-hidden="true" />
                    <span>24/7 Emergency &amp; Ambulance</span>
                  </div>
                  <a
                    href={`tel:${hospital.contact.emergency.replace(/\s/g, "")}`}
                    className="block font-mono text-base font-bold text-[var(--navy-950)] hover:text-[var(--primary)] transition-colors"
                  >
                    {hospital.contact.emergency}
                  </a>
                  <p className="text-[11px] text-[var(--slate)]">
                    Immediate round-the-clock emergency medical response in Silchar.
                  </p>
                </div>
              </div>

              {/* Related Specialists in Same Department */}
              {relatedDoctors.length > 0 && (
                <div className="p-6 rounded-2xl bg-white border border-[var(--mist)] shadow-xs space-y-5">
                  <div>
                    <p className="eyebrow text-xs text-[var(--primary)] mb-1">Peer Specialists</p>
                    <h3 className="font-display font-bold text-lg text-[var(--navy-950)]">
                      More {specialtyName} Doctors
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {relatedDoctors.map((peer) => {
                      const peerDisplayName = peer.name.startsWith("Dr.") ? peer.name : `Dr. ${peer.name}`;
                      return (
                        <Link
                          key={peer.id}
                          href={`/doctors/${peer.slug}`}
                          className="group flex items-center gap-3.5 p-3 rounded-xl border border-[var(--mist)]/70 hover:border-[var(--primary)] hover:bg-[var(--cloud)]/50 transition-all"
                          title={`View profile of ${peerDisplayName} – ${specialtyName} Specialist in Silchar`}
                        >
                          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[var(--primary-dark)] border border-[var(--mist)]">
                            {peer.photoUrl ? (
                              <Image
                                src={peer.photoUrl}
                                alt={`${peerDisplayName}, ${specialtyName} at South City Hospital, Silchar`}
                                width={48}
                                height={48}
                                sizes="48px"
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--accent)] bg-[var(--navy-950)]">
                                <Stethoscope size={20} aria-hidden="true" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-[var(--navy-950)] group-hover:text-[var(--primary)] transition-colors truncate">
                              {peerDisplayName}
                            </p>
                            <p className="text-xs text-[var(--slate)] truncate">
                              {peer.qualifications.join(", ")}
                            </p>
                            {peer.experienceYears > 0 && (
                              <p className="text-[11px] font-medium text-[var(--primary)] mt-0.5">
                                {peer.experienceYears}+ years experience
                              </p>
                            )}
                          </div>
                          <ChevronRight size={16} className="text-[var(--slate)]/40 group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
                        </Link>
                      );
                    })}
                  </div>

                  <Link
                    href="/doctors"
                    className="block text-center text-xs font-semibold text-[var(--primary)] hover:underline pt-2"
                  >
                    View All Doctors at South City Hospital →
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── Bottom Booking Call to Action ── */}
      <section className="py-12 bg-gradient-to-r from-[var(--navy-950)] to-[var(--primary-dark)] text-white text-center">
        <div className="container-site max-w-2xl">
          <p className="eyebrow text-[var(--accent)] mb-2">Book Your Appointment</p>
          <h2 className="font-display text-display-sm text-white mb-3">
            Schedule a Consultation with {displayName}
          </h2>
          <p className="text-white/80 text-sm mb-6">
            South City Hospital provides compassionate, expert healthcare in Meherpur, Silchar. Book your appointment online today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <DoctorProfileBookingAction doctor={doctor} size="large" />
            <Link
              href="/doctors"
              className="btn btn-outline text-white border-white/30 hover:bg-white hover:text-[var(--navy-950)] transition-all text-sm py-3 px-6"
            >
              Browse All Specialists
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
