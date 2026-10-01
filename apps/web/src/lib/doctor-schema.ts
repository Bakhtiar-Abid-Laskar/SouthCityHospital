import type { Doctor } from "@sch/types";
import { hospital, SITE_URL } from "@/data/hospital";
import { isValidRegistrationNumber } from "@/lib/slugs";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Parses day string into standard schema.org DayOfWeek values.
 * Handles single days ("Monday"), ranges ("Monday–Wednesday", "Monday - Saturday"),
 * and comma-separated lists ("Monday, Wednesday, Friday").
 */
function parseDaysToSchema(dayStr: string): string[] {
  if (!dayStr) return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const clean = dayStr.replace(/\s+/g, " ").trim();

  // Handle range like "Monday–Friday" or "Monday - Saturday"
  const rangeMatch = clean.match(/^([A-Za-z]+)\s*[–\-—to]+\s*([A-Za-z]+)$/i);
  if (rangeMatch) {
    const startDay = rangeMatch[1].trim();
    const endDay = rangeMatch[2].trim();
    const startIdx = DAYS_OF_WEEK.findIndex((d) => d.toLowerCase().startsWith(startDay.toLowerCase().slice(0, 3)));
    const endIdx = DAYS_OF_WEEK.findIndex((d) => d.toLowerCase().startsWith(endDay.toLowerCase().slice(0, 3)));
    if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
      return DAYS_OF_WEEK.slice(startIdx, endIdx + 1);
    }
  }

  // Handle comma/slash lists
  const parts = clean.split(/[,/&]+/).map((s) => s.trim());
  const matched: string[] = [];
  for (const part of parts) {
    const found = DAYS_OF_WEEK.find((d) => d.toLowerCase().startsWith(part.toLowerCase().slice(0, 3)));
    if (found && !matched.includes(found)) {
      matched.push(found);
    }
  }

  return matched.length > 0 ? matched : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
}

/**
 * Builds Schema.org openingHoursSpecification from doctor consultation schedules.
 */
function buildOpeningHours(schedules: Doctor["consultationSchedule"]) {
  if (!schedules || schedules.length === 0) return undefined;

  return schedules.map((slot) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: parseDaysToSchema(slot.day),
    opens: slot.startTime || "09:00",
    closes: slot.endTime || "13:00",
  }));
}

/**
 * Generates authoritative, geo-targeted FAQs for Google Rich Results (FAQPage) and AI Engines (ChatGPT, Gemini, Perplexity).
 * If the doctor already has custom FAQs, they are preserved; otherwise or in addition,
 * high-converting local intent questions are automatically generated.
 */
export function getAuthoritativeDoctorFaqs(
  doctor: Doctor,
  specialtyName: string
): Array<{ question: string; answer: string }> {
  const cleanName = doctor.name.replace(/\s+/g, " ").trim();
  const displayName = cleanName.startsWith("Dr.") ? cleanName : `Dr. ${cleanName}`;

  const scheduleText =
    doctor.consultationSchedule && doctor.consultationSchedule.length > 0
      ? doctor.consultationSchedule
          .map((s) => `${s.day} from ${s.startTime || "09:00"} to ${s.endTime || "13:00"}`)
          .join(", ")
      : "Monday to Saturday during hospital OPD hours";

  const expText =
    doctor.experienceYears > 0
      ? `with over ${doctor.experienceYears} years of clinical experience`
      : "with extensive clinical expertise";
  const qualText =
    doctor.qualifications && doctor.qualifications.length > 0
      ? ` (${doctor.qualifications.join(", ")})`
      : "";
  const expertiseText =
    doctor.expertise && doctor.expertise.length > 0
      ? doctor.expertise.join(", ")
      : `${specialtyName} consultations, diagnosis, clinical evaluation, and specialized medical treatments`;

  const defaultFaqs = [
    {
      question: `Where does ${displayName} consult patients in Silchar?`,
      answer: `${displayName} consults patients at South City Hospital, located in Meherpur, Silchar, Cachar, Assam (PIN: 788015). South City Hospital is a premier multi-specialty healthcare institution equipped with modern diagnostic facilities, in-house pharmacy, and 24/7 emergency response.`,
    },
    {
      question: `What are the OPD consultation timings and chamber days for ${displayName}?`,
      answer: `${displayName}${qualText} is available for outpatient consultations at South City Hospital on: ${scheduleText}. Timings are subject to surgical rotations and emergency duties; for today’s live OPD token status, please call hospital reception at ${hospital.contact.phone}.`,
    },
    {
      question: `How can I book an appointment with ${displayName} in Silchar?`,
      answer: `You can book an appointment with ${displayName} online through the official South City Hospital website at ${SITE_URL}/doctors/${doctor.slug}, or by calling the hospital desk directly at ${hospital.contact.phone} or emergency hotline at ${hospital.contact.emergency}. Walk-in registrations are also available at the Meherpur reception desk.`,
    },
    {
      question: `What medical conditions and treatments does ${displayName} specialize in?`,
      answer: `${displayName} specializes in ${specialtyName} ${expText}. Key clinical areas of focus include: ${expertiseText}. Consultations include comprehensive patient assessment, evidence-based diagnoses, and personalized treatment plans.`,
    },
    {
      question: `Can patients from outside Silchar (Hailakandi, Karimganj, Barak Valley, Mizoram) consult ${displayName}?`,
      answer: `Yes. Patients from across Cachar, Hailakandi, Karimganj, Dima Hasao, Mizoram, and Tripura regularly travel to South City Hospital in Meherpur, Silchar for consultation with ${displayName}. The hospital provides prioritized outpatient services and complete emergency admission support.`,
    },
  ];

  // If doctor has custom FAQs, merge them with non-duplicate defaults
  if (doctor.faqs && doctor.faqs.length > 0) {
    const customQuestions = new Set(doctor.faqs.map((f) => f.question.toLowerCase().trim()));
    const remainingDefaults = defaultFaqs.filter(
      (f) => !customQuestions.has(f.question.toLowerCase().trim())
    );
    return [...doctor.faqs, ...remainingDefaults];
  }

  return defaultFaqs;
}

/**
 * Builds Schema.org FAQPage JSON-LD representation for Google Rich Snippets & AI answers.
 */
export function buildDoctorFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

/**
 * Builds standard Schema.org Physician JSON-LD representation with deep Geo, LocalBusiness, and AI Knowledge Graph anchoring.
 */
export function buildPhysicianSchema(
  doctor: Doctor,
  departmentName: string,
  canonicalUrl: string,
  description: string
) {
  const cleanName = doctor.name.replace(/\s+/g, " ").trim();
  const rawName = cleanName.replace(/^Dr\.\s*/i, "");
  const displayName = cleanName.startsWith("Dr.") ? cleanName : `Dr. ${cleanName}`;

  // Alternate names to capture all Google and AI search permutations
  const alternateNames = [
    cleanName,
    rawName,
    `${displayName} Silchar`,
    `${rawName} Silchar`,
    `${displayName} South City Hospital`,
    `${rawName} South City Hospital`,
    `${rawName} Doctor Silchar`,
    `${specialtyOrDepartment(departmentName)} in Silchar`,
  ].filter((name, idx, arr) => arr.indexOf(name) === idx);

  // Qualifications mapped to EducationalOccupationalCredential
  const credentials = (doctor.qualifications || []).map((q) => ({
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "degree",
    name: q,
  }));

  // Education background mapped to EducationalOrganization
  const alumni = (doctor.education || []).map((e) => ({
    "@type": "EducationalOrganization",
    name: e.institution,
  }));

  // Areas of expertise / conditions treated
  const knowsAbout =
    doctor.expertise && doctor.expertise.length > 0
      ? doctor.expertise
      : [departmentName, `${departmentName} diagnosis and treatment`, "Outpatient Clinical Care"];

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": ["Physician", "MedicalBusiness"],
    "@id": `${canonicalUrl}#physician`,
    name: displayName,
    alternateName: alternateNames,
    honorificPrefix: "Dr.",
    jobTitle: `${departmentName} Specialist & Consultant`,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    medicalSpecialty: departmentName,
    telephone: hospital.contact.phone,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Credit Card, Debit Card, Net Banking, Health Insurance",
    isAcceptingNewPatients: true,
    address: {
      "@type": "PostalAddress",
      streetAddress: hospital.location.area,
      addressLocality: hospital.location.city,
      addressRegion: hospital.location.state,
      postalCode: hospital.location.pincode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: hospital.location.geo.latitude,
      longitude: hospital.location.geo.longitude,
    },
    areaServed: hospital.areasServed.map((a) => ({
      "@type": a.type,
      name: a.name,
      sameAs: a.sameAs,
    })),
    knowsAbout,
    worksFor: {
      "@type": "Hospital",
      "@id": `${SITE_URL}/#hospital`,
      name: hospital.name,
      legalName: `${hospital.name}, Silchar`,
      url: SITE_URL,
      telephone: hospital.contact.emergency,
      address: {
        "@type": "PostalAddress",
        streetAddress: hospital.location.area,
        addressLocality: hospital.location.city,
        addressRegion: hospital.location.state,
        postalCode: hospital.location.pincode,
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: hospital.location.geo.latitude,
        longitude: hospital.location.geo.longitude,
      },
    },
    hospitalAffiliation: {
      "@type": "Hospital",
      "@id": `${SITE_URL}/#hospital`,
      name: hospital.name,
      url: SITE_URL,
    },
    availableService: [
      {
        "@type": "MedicalProcedure",
        name: `${departmentName} Outpatient Consultation`,
      },
      ...(doctor.expertise || []).map((exp) => ({
        "@type": "MedicalProcedure",
        name: exp,
      })),
    ],
  };

  if (description) {
    schema.description = description;
  }

  if (doctor.photoUrl) {
    schema.image = doctor.photoUrl;
  }

  if (credentials.length > 0) {
    schema.hasCredential = credentials;
  }

  if (alumni.length > 0) {
    schema.alumniOf = alumni;
  }

  const hours = buildOpeningHours(doctor.consultationSchedule);
  if (hours && hours.length > 0) {
    schema.openingHoursSpecification = hours;
  }

  if (doctor.languages && doctor.languages.length > 0) {
    schema.knowsLanguage = doctor.languages;
  }

  if (isValidRegistrationNumber(doctor.registrationNumber)) {
    schema.identifier = {
      "@type": "PropertyValue",
      name: "Medical Council Registration Number",
      value: doctor.registrationNumber.trim(),
    };
  }

  return schema;
}

function specialtyOrDepartment(dept: string): string {
  if (dept.toLowerCase().includes("specialist")) return dept;
  return `${dept} Specialist`;
}

/**
 * Builds Schema.org BreadcrumbList JSON-LD representation.
 */
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Builds site-wide Hospital Schema.org JSON-LD representation with full Geo & AI Knowledge Graph anchoring.
 */
export function buildHospitalSchema() {
  const googleBusinessUrl =
    process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL ||
    "https://www.google.com/maps/place/South+City+Hospital/@24.785576,92.7955732,17z";

  const sameAs = [
    hospital.social.facebook,
    hospital.social.instagram,
    googleBusinessUrl,
    hospital.geoEntities.silcharWikidata,
    hospital.geoEntities.silcharWikipedia,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": ["Hospital", "EmergencyService", "MedicalOrganization"],
    "@id": `${SITE_URL}/#hospital`,
    name: hospital.name,
    legalName: `${hospital.name}, Silchar`,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.webp`,
    image: `${SITE_URL}/og-image.jpg`,
    description: hospital.about,
    telephone: hospital.contact.phone,
    emergencyTelephone: hospital.contact.emergency,
    openingHours: "Mo-Su 00:00-24:00",
    isAcceptingNewPatients: true,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Credit Card, UPI, Net Banking, Health Insurance",
    hasMap: googleBusinessUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: hospital.location.area,
      addressLocality: hospital.location.city,
      addressRegion: hospital.location.state,
      postalCode: hospital.location.pincode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: hospital.location.geo.latitude,
      longitude: hospital.location.geo.longitude,
    },
    areaServed: hospital.areasServed.map((area) => ({
      "@type": area.type,
      name: area.name,
      sameAs: area.sameAs,
    })),
    medicalSpecialty: [
      "Orthopedics",
      "Cardiology",
      "Urology",
      "Gynecology",
      "Obstetrics",
      "NeurologicalSurgery",
      "Pediatrics",
      "InternalMedicine",
      "Gastroenterology",
      "Otolaryngology",
      "CriticalCare",
      "EmergencyMedicine",
      "DiagnosticRadiology",
    ],
    availableService: [
      {
        "@type": "MedicalProcedure",
        name: "24/7 Emergency & Trauma Care",
      },
      {
        "@type": "MedicalProcedure",
        name: "Intensive Care Unit (ICU) & Coronary Care Unit (CCU)",
      },
      {
        "@type": "MedicalProcedure",
        name: "Hemodialysis Unit",
      },
      {
        "@type": "MedicalProcedure",
        name: "Digital X-Ray & Ultrasonography (USG)",
      },
      {
        "@type": "MedicalProcedure",
        name: "Advanced Laparoscopic & Laser Urology Surgery",
      },
      {
        "@type": "MedicalProcedure",
        name: "24-Hour Ambulance Hotline",
      },
    ],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}
