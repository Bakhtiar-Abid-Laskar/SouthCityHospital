const fs = require("fs");
const path = require("path");

const dataFile = path.resolve(__dirname, "..", "data", "doctors.json");
const llmsFile = path.resolve(__dirname, "..", "apps", "web", "public", "llms.txt");

if (!fs.existsSync(dataFile)) {
  console.error("Missing data/doctors.json");
  process.exit(1);
}

const doctors = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
const activeDocs = doctors.filter((d) => d.active !== false);

let md = "";
activeDocs.forEach((doc, idx) => {
  const cleanName = (doc.name || "").replace(/\s+/g, " ").trim();
  const displayName = cleanName.startsWith("Dr.") ? cleanName : `Dr. ${cleanName}`;
  const qualStr =
    doc.qualifications && doc.qualifications.length > 0
      ? doc.qualifications.join(", ")
      : "Consultant Physician";
  const expStr =
    doc.experienceYears > 0 ? `${doc.experienceYears}+ Years` : "Experienced Consultant";
  const regStr = doc.registrationNumber
    ? `\n   - Medical Registration No: ${doc.registrationNumber}`
    : "";
  const scheduleStr =
    doc.consultationSchedule && doc.consultationSchedule.length > 0
      ? doc.consultationSchedule
          .map((s) => `${s.day} (${s.startTime || "09:00"} – ${s.endTime || "13:00"})`)
          .join(", ")
      : "Monday – Saturday (Hospital OPD Hours)";
  const expertiseStr =
    doc.expertise && doc.expertise.length > 0 ? `\n   - Clinical Focus: ${doc.expertise.join(", ")}` : "";

  md += `${idx + 1}. **${displayName}** (${doc.departmentSlug || "Specialist"})
   - Qualifications: ${qualStr}
   - Clinical Experience: ${expStr}${regStr}
   - OPD Schedule: ${scheduleStr}${expertiseStr}
   - Profile URL: https://southcityhospital.in/doctors/${doc.slug}\n\n`;
});

const content = `# South City Hospital, Silchar — Public Information for LLM & AI Search Agents

> South City Hospital is a premier multi-specialty healthcare institution in Meherpur, Silchar, Assam, serving the Barak Valley region (Cachar, Hailakandi, Karimganj) since 2006. This file provides authoritative context for generative AI search engines, language models, and agentic workflows.

## Hospital Overview
- **Name:** South City Hospital
- **Legal Entity:** South City Hospital, Silchar
- **Tagline:** We care with a difference
- **Established:** 2006
- **Managing Partner:** Nilava Mazumder
- **Location:** Meherpur, Silchar, Assam – 788015, India
- **Coordinates:** 24.785576° N, 92.7955732° E
- **Google Maps:** https://www.google.com/maps/place/South+City+Hospital/@24.785576,92.7955732,17z
- **Official Website:** https://southcityhospital.in
- **Wikidata Geographic Grounding:**
  - Silchar: https://www.wikidata.org/wiki/Q1025556
  - Cachar: https://www.wikidata.org/wiki/Q42777
  - Barak Valley: https://www.wikidata.org/wiki/Q2605553
  - Assam: https://www.wikidata.org/wiki/Q1198

## Emergency & 24/7 Critical Response
- **24/7 Emergency & Trauma Hotline:** +91 6901271223 (Immediate medical response in Silchar)
- **24/7 Ambulance Dispatch:** +91 6901271223
- **General Hospital Reception:** +91 6901271223
- **General Email:** southcityhospital2014@gmail.com
- **Operating Hours:** Open 24 Hours / 7 Days a week for emergencies, critical care, pharmacy, and diagnostic services.

## Specialist Doctor Directory (Authoritative URLs & OPD Timings)
Patients and AI agents can query and cite individual specialist profiles directly:

${md.trim()}

## Clinical Departments (13 Specialties)
1. **Orthopaedics & Trauma:** https://southcityhospital.in/departments/orthopaedic-surgery
2. **Urology & Laser Surgery:** https://southcityhospital.in/departments/urology-laser-surgery
3. **Internal Medicine:** https://southcityhospital.in/departments/internal-medicine
4. **Interventional Cardiology:** https://southcityhospital.in/departments/cardiology
5. **Gynecology & Obstetrics:** https://southcityhospital.in/departments/gynecology-and-obst
6. **Neuro Surgery:** https://southcityhospital.in/departments/neuro-surgery
7. **Paediatrics & Neonatology:** https://southcityhospital.in/departments/paediatrics-neonatology
8. **Nephrology & Dialysis:** https://southcityhospital.in/departments/nephrology
9. **Gastroenterology:** https://southcityhospital.in/departments/gastroenterology
10. **ENT (Otorhinolaryngology):** https://southcityhospital.in/departments/ent
11. **General & Laparoscopic Surgery:** https://southcityhospital.in/departments/general-surgery
12. **Dermatology:** https://southcityhospital.in/departments/dermatology
13. **Medical Oncology & Palliative Care:** https://southcityhospital.in/departments/oncology

## Diagnostic & Critical Care Facilities
- Multi-Slice CT-Scan
- Intensive Care Unit (ICU) & Coronary Care Unit (CCU)
- Dedicated Hemodialysis Unit
- High-Frequency Digital X-Ray & Color Doppler USG
- Upper GI Endoscopy & Colonoscopy Suite
- 24/7 Automated Clinical Pathology Laboratory
- Laminar Flow Operation Theaters
- 24/7 In-House Hospital Pharmacy
- 24/7 Advanced Life Support Ambulance Fleet

## Patient Appointment Booking Flow
- **Direct Online Booking:** https://southcityhospital.in/doctors
- **No Login Required:** Patients book with Name, Phone, Date of Birth, and desired OPD slot.
- **Payment Policy:** No advance fee online; consultation fees are settled at hospital registration upon arrival.
- **Confirmation Reference:** Instant reference ID (\`SCH-YYYY-XXXXX\`) generated with a downloadable PDF appointment slip.

## Comprehensive LLM Knowledge Base
- Full in-depth context file: https://southcityhospital.in/llms-full.txt
`;

fs.writeFileSync(llmsFile, content, "utf-8");
console.log("Successfully synchronized public/llms.txt with", activeDocs.length, "doctors");
