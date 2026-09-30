/**
 * South City Hospital — FAQ (5 items)
 * Hardcoded static content. Verbatim from spec.
 */

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    id: "emergency-247",
    question:
      "Are emergency services available 24/7 at South City Hospital?",
    answer:
      "Yes, our Emergency Department operates 24 hours a day, 7 days a week with round-the-clock medical staff, ambulance response (+91 6901271223), and immediate access to ICU/CCU critical care units.",
  },
  {
    id: "departments-facilities",
    question:
      "What clinical departments and diagnostic facilities are available?",
    answer:
      "South City Hospital houses 11 specialized clinical departments (Internal Medicine, Orthopaedics, Neuro Surgery, Gynecology and Obstetrics, Interventional Cardiology, Paediatrics, Nephrology, Urology, Laparoscopic Surgery, Endoscopic Surgery, Plastic Surgery) and 12 diagnostic/critical care units.",
  },
  {
    id: "emergency-admission",
    question:
      "How do I confirm emergency admission or ambulance dispatch?",
    answer:
      "Call our direct emergency helpline (+91 6901271223) or arrive directly at our Emergency Room desk in Meherpur, Silchar. Triage and critical stabilization begin immediately upon arrival.",
  },
  {
    id: "lab-results",
    question: "How quickly are lab test results available?",
    answer:
      "Most routine pathology and LIS laboratory results are available on the same day. Physical reports can be collected at the hospital counter, or requested digitally.",
  },
  {
    id: "visiting-hours",
    question:
      "What are the visiting hours and attendant rules for admitted patients?",
    answer:
      "Typically, one designated attendant pass is issued per admitted patient. Visiting hours are during afternoon and evening designated slots. Stricter visitor rules apply in ICU/CCU units, and protective masks/sanitization are enforced. Visits by children under 12 are discouraged for safety.",
  },
];
