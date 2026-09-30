/**
 * South City Hospital — Privacy Policy Data
 * Static source of truth for patient data privacy, security, and retention.
 */

export interface LegalSection {
  id: string;
  title: string;
  content: string[];
}

export const privacyPolicy = {
  title: "Privacy Policy",
  lastUpdated: "August 2026",
  introduction:
    "South City Hospital, located in Meherpur, Silchar, Assam, is committed to safeguarding the personal and health information of our patients, visitors, and website users. This Privacy Policy explains what data we collect, how it is stored and protected, and your rights regarding your personal information.",
  sections: [
    {
      id: "data-collection",
      title: "1. Information We Collect",
      content: [
        "When you use our online appointment booking system or contact form, we collect only the information necessary to schedule and manage your medical consultation:",
        "Patient Identification: Full name, phone number, and date of birth (used to verify patient identity without requiring a login account).",
        "Appointment Preferences: Preferred consultation date, preferred time slot, and chosen clinical department or doctor.",
        "Clinical Context (Optional): Brief reason for visit or symptoms described voluntarily by the patient in the message field.",
        "Technical Metadata: Standard browser session information and anonymized access logs to ensure website performance and security.",
      ],
    },
    {
      id: "data-usage",
      title: "2. How We Use Your Information",
      content: [
        "Your personal data is used solely for healthcare operations and patient service delivery:",
        "Scheduling and confirming doctor appointments across our clinical departments.",
        "Generating official hospital booking references and downloadable verification slips.",
        "Enabling patients to look up appointment status securely using their booking reference or verified phone number and date of birth.",
        "Contacting you with critical appointment updates, doctor schedule adjustments, or emergency notices.",
      ],
    },
    {
      id: "data-storage-security",
      title: "3. Data Storage & Security Controls",
      content: [
        "All booking records are stored in enterprise-grade cloud database infrastructure equipped with Row-Level Security (RLS) policies.",
        "Public users can only access their specific appointment records by providing dual matching identifiers (Reference ID or Phone + Date of Birth).",
        "Administrative and medical staff access is strictly restricted to authenticated hospital personnel with role-based access permissions.",
        "All data transmitted between your browser and our servers is encrypted in transit using industry-standard TLS 1.3 encryption.",
      ],
    },
    {
      id: "no-third-party-sharing",
      title: "4. No Sale or Marketing Sharing of Data",
      content: [
        "South City Hospital maintains a strict zero-sharing policy regarding patient data.",
        "We do not sell, rent, lease, or share your personal contact details, medical preferences, or appointment history with any third-party marketing agencies, advertisers, or external commercial entities.",
        "Information is disclosed only when required by applicable Indian healthcare regulations or lawful court orders.",
      ],
    },
    {
      id: "retention-policy",
      title: "5. Data Retention Posture",
      content: [
        "Appointment booking records are retained in compliance with Indian medical record retention standards to maintain patient care continuity and hospital operational audit trails.",
        "Patients may request verification, correction, or anonymization of non-statutory personal details by contacting our administrative office.",
      ],
    },
    {
      id: "contact-privacy",
      title: "6. Privacy Enquiries & Contact",
      content: [
        "If you have questions regarding this Privacy Policy, your personal data, or our data handling practices, please contact our data governance desk:",
        "Hospital Administration, South City Hospital",
        "Meherpur, Silchar, Assam – 788015",
        "Email: southcityhospital2014@gmail.com | Phone: +91 6901271223",
      ],
    },
  ],
};
