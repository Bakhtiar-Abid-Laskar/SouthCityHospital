export const SITE_URL = "https://southcityhospital.in";

/**
 * Generates an authoritative, absolute, lowercase canonical URL.
 */
export function getCanonicalUrl(path = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return cleanPath === "/" ? SITE_URL : `${SITE_URL}${cleanPath}`;
}

export const hospital = {
  name: "South City Hospital",
  domain: "southcityhospital.in",
  baseUrl: SITE_URL,
  tagline: "We care with a difference",
  established: 2006,
  managingPartner: "Nilava Mazumder",
  location: {
    address: "Meherpur, Silchar, Assam – 788015",
    area: "Meherpur",
    city: "Silchar",
    state: "Assam",
    pincode: "788015",
  },
  contact: {
    phone: "+91 6901271223",
    emergency: "+91 6901271223",
    email: "southcityhospital2014@gmail.com",
  },
  opd: {
    hours: "24x7 / Round-the-Clock",
    days: "Monday – Sunday",
  },
  social: {
    instagram: "https://www.instagram.com/southcityhospitalsilchar",
    instagramHandle: "@southcityhospitalsilchar",
    facebook: "https://www.facebook.com/southcityhospitalsilchar",
    facebookHandle: "southcityhospitalsilchar",
  },
  about:
    "Founded in 2006, South City Hospital was built with a clear purpose: to deliver accessible, high-quality multi-specialty medical care to the people of Silchar and the surrounding Barak Valley region of Assam. Under the stewardship of Nilava Mazumder, South City Hospital has expanded from a specialized clinic into a 13-department clinical center with 13 diagnostic and critical care facilities, providing round-the-clock emergency medical services.",
  stats: {
    departments: 13,
    facilities: 13,
    yearsOfService: new Date().getFullYear() - 2006,
  },
  coreValues: [
    {
      id: "critical-response",
      title: "24/7 Critical Response",
      description:
        "Fully operational round-the-clock emergency room, ICU, CCU, and 24-hour ambulance hotline.",
      icon: "siren",
    },
    {
      id: "clinical-rigor",
      title: "Clinical Rigor",
      description:
        "13 clinical departments covering surgical, medical, diagnostic, and urological interventions.",
      icon: "stethoscope",
    },
    {
      id: "community-trust",
      title: "Community Trust",
      description:
        "Trusted by thousands of families across Silchar, Meherpur, and neighboring regions for over 20 years.",
      icon: "shield-check",
    },
  ],
} as const;

export type Hospital = typeof hospital;
