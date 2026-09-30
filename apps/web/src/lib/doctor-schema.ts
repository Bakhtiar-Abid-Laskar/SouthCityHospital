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
 * Builds standard Schema.org Physician JSON-LD representation.
 */
export function buildPhysicianSchema(
  doctor: Doctor,
  departmentName: string,
  canonicalUrl: string,
  description: string
) {
  const cleanName = doctor.name.replace(/\s+/g, " ").trim();
  const displayName = cleanName.startsWith("Dr.") ? cleanName : `Dr. ${cleanName}`;

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: displayName,
    url: canonicalUrl,
    medicalSpecialty: departmentName,
    telephone: hospital.contact.phone,
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
    isAcceptingNewPatients: true,
    worksFor: {
      "@type": "Hospital",
      "@id": `${SITE_URL}/#hospital`,
      name: hospital.name,
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
    },
  };

  if (description) {
    schema.description = description;
  }

  if (doctor.photoUrl) {
    schema.image = doctor.photoUrl;
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
