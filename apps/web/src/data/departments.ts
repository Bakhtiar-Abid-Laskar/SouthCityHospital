/**
 * South City Hospital — Clinical Departments (13 total)
 * Icons: Lucide React — one unique, clinically-appropriate icon per department.
 */

export interface Department {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  overview: string;
  commonTreatments: string[];
  icon: string;          // Lucide icon component name
  color: string;         // CSS variable for accent color on card
}

export const departments: Department[] = [
  {
    id: "internal-medicine",
    slug: "internal-medicine",
    name: "Internal Medicine",
    shortDescription:
      "Comprehensive primary care, chronic disease management, and adult health diagnostics.",
    overview:
      "Provides primary care, diagnostic evaluation, and long-term management for complex multi-system medical conditions in adult patients.",
    commonTreatments: [
      "Hypertension & Diabetes Management",
      "Adult Infectious Diseases",
      "Preventive Health Screenings",
      "Multi-Organ System Disorders",
    ],
    icon: "Stethoscope",
    color: "var(--primary)",
  },
  {
    id: "orthopaedic-surgery",
    slug: "orthopaedic-surgery",
    name: "Orthopaedic Surgery",
    shortDescription:
      "Advanced bone, joint, and trauma care, fracture management, and joint replacements.",
    overview:
      "Specializing in emergency trauma care, fracture reduction, joint reconstruction, and complex musculoskeletal surgery with integrated post-operative rehabilitation.",
    commonTreatments: [
      "Fracture Trauma & Fixation",
      "Arthritic Joint Reconstruction",
      "Spinal & Back Pain Care",
      "Sports Injury Management",
    ],
    icon: "Bone",
    color: "var(--primary-mid)",
  },
  {
    id: "neuro-surgery",
    slug: "neuro-surgery",
    name: "Neuro Surgery",
    shortDescription:
      "Surgical treatment for brain, spine, and peripheral nerve disorders.",
    overview:
      "Equipped with advanced surgical technology and dedicated neuro-intensive care, our neurology and neuro-surgery team handles head injuries, brain tumors, and spinal column pathologies.",
    commonTreatments: [
      "Traumatic Brain Injury Management",
      "Spinal Cord & Disc Surgery",
      "Neuro-Oncology Surgery",
      "Stroke & Cerebrovascular Care",
    ],
    icon: "Brain",
    color: "var(--accent)",
  },
  {
    id: "general-laparoscopic-surgery",
    slug: "general-laparoscopic-surgery",
    name: "General & Laparoscopic Surgery",
    shortDescription:
      "Minimally invasive and general surgical procedures.",
    overview:
      "Performing keyhole (laparoscopic) and open surgical procedures with reduced recovery times, minimal scarring, and high patient safety protocols.",
    commonTreatments: [
      "Laparoscopic Cholecystectomy (Gallbladder)",
      "Hernia Repair & Mesh Placement",
      "Appendectomy",
      "Abdominal Wall Reconstruction",
    ],
    icon: "Scissors",
    color: "var(--primary)",
  },
  {
    id: "endoscopic-surgery",
    slug: "endoscopic-surgery",
    name: "Endoscopic Surgery",
    shortDescription:
      "Diagnostic and therapeutic GI and airway endoscopy.",
    overview:
      "Advanced endoscopic evaluation of the gastrointestinal tract, enabling early detection and therapeutic interventions without open surgery.",
    commonTreatments: [
      "Diagnostic Upper GI Endoscopy",
      "Polypectomy & Mucosal Resection",
      "Stricture Dilatation",
      "Foreign Body Removal",
    ],
    icon: "Microscope",
    color: "var(--primary-mid)",
  },
  {
    id: "gynecology-and-obst",
    slug: "gynecology-and-obst",
    name: "Gynecology and Obstetrics",
    shortDescription:
      "Women's healthcare, maternity services, and reproductive health care.",
    overview:
      "Providing holistic care for women across all stages of life, including prenatal care, high-risk obstetrics, gynecological surgeries, and preventive screenings.",
    commonTreatments: [
      "High-Risk Pregnancy Management",
      "Laparoscopic Gynecological Surgery",
      "Preventive Cervical & Breast Screening",
      "Infertility Evaluation",
    ],
    icon: "Baby",
    color: "var(--primary)",
  },
  {
    id: "urology-laser-surgery",
    slug: "urology-laser-surgery",
    name: "Urology & Laser Surgery",
    shortDescription:
      "Kidney stone treatments, prostate care, and advanced urinary tract procedures.",
    overview:
      "State-of-the-art laser urology unit for bloodless kidney stone removal, prostate treatment, and specialized reconstructive urologic care.",
    commonTreatments: [
      "Laser Kidney Stone Lithotripsy (RIRS/URSL)",
      "Prostate Laser Surgery (TURP/HoLEP)",
      "Urinary Tract Infection Care",
      "Uroflowmetry Assessment",
    ],
    icon: "Zap",
    color: "var(--accent)",
  },
  {
    id: "nephrology",
    slug: "nephrology",
    name: "Nephrology",
    shortDescription:
      "Kidney disease management, hypertension care, and continuous dialysis services.",
    overview:
      "Dedicated renal care center providing diagnosis and treatment for acute kidney injury, chronic renal failure, diabetic nephropathy, and round-the-clock hemodialysis.",
    commonTreatments: [
      "Chronic Kidney Disease (CKD) Management",
      "Acute Renal Failure Care",
      "24/7 Hemodialysis Unit",
      "Renal Hypertension Management",
    ],
    icon: "Droplets",
    color: "var(--primary-mid)",
  },
  {
    id: "cardiology",
    slug: "cardiology",
    name: "Interventional Cardiology",
    shortDescription:
      "Heart health diagnostics, Holter monitoring, ECG, and critical cardiac care.",
    overview:
      "Comprehensive cardiac diagnostics including 24-hour Holter monitoring, Color Doppler Echocardiography, and immediate cardiac emergency stabilization in our CCU.",
    commonTreatments: [
      "Emergency Cardiac Stabilization",
      "24-Hour Holter ECG Monitoring",
      "Color Doppler 2D/3D Echocardiography",
      "Hypertension & Lipid Management",
    ],
    icon: "HeartPulse",
    color: "var(--emergency)",
  },
  {
    id: "plastic-surgery",
    slug: "plastic-surgery",
    name: "Plastic Surgery",
    shortDescription:
      "Reconstructive, trauma, and cosmetic surgical procedures.",
    overview:
      "Expert surgical care for trauma reconstruction, burn management, skin grafts, scar revision, and congenital abnormality repairs.",
    commonTreatments: [
      "Post-Traumatic Soft Tissue Reconstruction",
      "Burn Injury Care & Skin Grafting",
      "Scar Revision",
      "Maxillofacial Fracture Repair",
    ],
    icon: "ScanFace",
    color: "var(--primary)",
  },
  {
    id: "paediatrics",
    slug: "paediatrics",
    name: "Paediatrics",
    shortDescription:
      "Infant, child, and adolescent medical care and pediatric critical monitoring.",
    overview:
      "Compassionate healthcare for newborns, infants, and young adults, supported by specialized pediatric nursing and critical care monitoring.",
    commonTreatments: [
      "Newborn & Pediatric Illness Care",
      "Vaccination & Growth Tracking",
      "Pediatric Emergency Stabilization",
      "Childhood Infectious Disease Care",
    ],
    icon: "ShieldCheck",
    color: "var(--primary-mid)",
  },
  {
    id: "anaesthesiology",
    slug: "anaesthesiology",
    name: "Anaesthesiology",
    shortDescription: "Specialized pain relief and medical care during surgical procedures.",
    overview: "Providing comprehensive perioperative care, pain management, and critical life support before, during, and after surgical interventions.",
    commonTreatments: [
      "General Anaesthesia",
      "Regional Anaesthesia",
      "Post-operative Pain Management",
      "Critical Care Support",
    ],
    icon: "Syringe",
    color: "var(--primary-dark)",
  },
  {
    id: "oncology",
    slug: "oncology",
    name: "Oncology",
    shortDescription: "Comprehensive cancer diagnosis, staging, and treatment planning.",
    overview: "Dedicated to the early detection, specialized treatment, and ongoing management of various cancers using multidisciplinary approaches.",
    commonTreatments: [
      "Chemotherapy Services",
      "Cancer Screening & Diagnosis",
      "Tumour Board Consultation",
      "Palliative Care",
    ],
    icon: "Dna",
    color: "var(--emergency)",
  },
];
