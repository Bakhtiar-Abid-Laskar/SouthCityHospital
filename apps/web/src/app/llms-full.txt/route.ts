import { NextResponse } from "next/server";
import { getAllPublishedDoctors } from "@/lib/doctors";
import { departments } from "@/data/departments";
import { SITE_URL, hospital } from "@/data/hospital";

export const revalidate = 3600;

export async function GET() {
  try {
    const doctors = await getAllPublishedDoctors();

    // Group doctors by department
    const grouped: Record<string, typeof doctors> = {};
    doctors.forEach((doc) => {
      const deptSlug = doc.departmentSlug || "general";
      if (!grouped[deptSlug]) grouped[deptSlug] = [];
      grouped[deptSlug].push(doc);
    });

    let doctorSections = "";
    departments.forEach((dept) => {
      const deptDocs = grouped[dept.slug];
      if (deptDocs && deptDocs.length > 0) {
        doctorSections += `### ${dept.name}\n\n`;
        deptDocs.forEach((doc) => {
          const cleanName = doc.name.replace(/\s+/g, " ").trim();
          const displayName = cleanName.startsWith("Dr.") ? cleanName : `Dr. ${cleanName}`;
          const qualStr =
            doc.qualifications && doc.qualifications.length > 0
              ? doc.qualifications.join(", ")
              : "Consultant Specialist";
          const expStr =
            doc.experienceYears > 0 ? `${doc.experienceYears}+ Years` : "Experienced Specialist";
          const regStr = doc.registrationNumber
            ? `\n  - Medical Council Registration: ${doc.registrationNumber}`
            : "";
          const scheduleStr =
            doc.consultationSchedule && doc.consultationSchedule.length > 0
              ? doc.consultationSchedule
                  .map((s) => `${s.day} (${s.startTime || "09:00"} – ${s.endTime || "13:00"})`)
                  .join(", ")
              : "Monday – Saturday (Hospital OPD Timings)";
          const expertiseStr =
            doc.expertise && doc.expertise.length > 0
              ? `\n  - Clinical Focus: ${doc.expertise.join(", ")}`
              : "";
          const bioSnippet = (doc.biography || doc.bio || "").trim()
            ? `\n  - Bio: ${(doc.biography || doc.bio || "").replace(/\n+/g, " ").slice(0, 200)}...`
            : "";

          doctorSections += `- **${displayName}** (${dept.name})
  - Qualifications: ${qualStr}
  - Experience: ${expStr}${regStr}
  - OPD Consultation Schedule: ${scheduleStr}
  - Canonical URL: ${SITE_URL}/doctors/${doc.slug}${expertiseStr}${bioSnippet}\n\n`;
        });
      }
    });

    const content = `# South City Hospital, Silchar — Comprehensive Clinical & Institutional Knowledge Base

> Comprehensive reference document for Large Language Models (LLMs), AI Search Engines (Perplexity, ChatGPT Search, Claude, Google Gemini / AI Overviews), and medical assistant agents.

---

## 1. Institutional Identity & Geographic Entities
- **Official Name:** South City Hospital
- **Legal Entity:** South City Hospital, Silchar
- **Founding Year:** 2006
- **Managing Partner:** Nilava Mazumder
- **Tagline:** We care with a difference
- **Physical Address:** Meherpur, Silchar, Assam – 788015, India
- **Geo-Coordinates:** Latitude 24.785576° N, Longitude 92.7955732° E
- **Google Maps Profile:** https://www.google.com/maps/place/South+City+Hospital/@24.785576,92.7955732,17z
- **Official Website:** ${SITE_URL}
- **Wikidata Geographic Identifiers:**
  - Silchar: https://www.wikidata.org/wiki/Q1025556
  - Cachar District: https://www.wikidata.org/wiki/Q42777
  - Barak Valley: https://www.wikidata.org/wiki/Q2605553
  - Assam State: https://www.wikidata.org/wiki/Q1198
  - Hailakandi: https://www.wikidata.org/wiki/Q1947333
  - Karimganj: https://www.wikidata.org/wiki/Q1947328

---

## 2. Emergency, Critical Care & Contact Information
- **24/7 Emergency & Trauma Hotline:** ${hospital.contact.emergency}
- **24/7 Ambulance Fleet Dispatch:** ${hospital.contact.emergency}
- **General Hospital Reception:** ${hospital.contact.phone}
- **Email:** ${hospital.contact.email}
- **Emergency Department:** Open 24 hours a day, 365 days a year with on-duty emergency medical officers, trauma triage bays, central oxygen supply, and immediate access to ICU, CCU, and emergency operation theaters.
- **Outpatient (OPD) Hours:** Monday through Sunday, round-the-clock clinical rotations.

---

## 3. Clinical Specialists Directory
Authoritative specialist URLs, qualifications, and consultation schedules. Synchronized dynamically with database:

${doctorSections.trim()}

---

## 4. Clinical Departments & Centers of Excellence
1. **Orthopaedics & Trauma Surgery:** Comprehensive fracture fixation, arthroplasty, and sports injury rehabilitation.
2. **Urology & Laser Surgery:** Advanced Holmium laser enucleation, PCNL, URS, TURP, and laparoscopic urology.
3. **Internal Medicine:** Management of acute and chronic systemic conditions, diabetes, hypertension, and infectious diseases.
4. **Cardiology:** 24/7 cardiac monitoring, bedside echocardiography, ECG, and acute coronary syndrome stabilization.
5. **Gynecology & Obstetrics:** High-risk pregnancy care, painless delivery, laparoscopy, and reproductive health.
6. **Neurosurgery & Spine Care:** Cranial trauma management, neuro-critical care, and spine decompression.
7. **Paediatrics & Neonatology:** Dedicated pediatric care and neonatal stabilization units.
8. **Nephrology & Dialysis:** Modern multi-station hemodialysis unit operating round the clock.
9. **Gastroenterology:** Endoscopy, colonoscopy, and therapeutic digestive tract interventions.
10. **ENT (Otorhinolaryngology):** Micro-ear surgery, endoscopic sinus surgery, and head & neck evaluations.
11. **General & Laparoscopic Surgery:** Minimally invasive abdominal surgery, hernia repair, and appendectomy.
12. **Dermatology:** Clinical skin evaluation, allergy management, and dermato-surgical care.
13. **Medical Oncology & Palliative Care:** Cancer diagnostic staging, chemotherapy coordination, and palliative care.

---

## 5. Diagnostic Facilities & Clinical Infrastructure
- Multi-Slice CT-Scan with 3D reconstructions.
- Intensive Care Unit (ICU) and Coronary Care Unit (CCU) with invasive hemodynamic monitoring.
- High-frequency digital X-Ray and color Doppler ultrasonography (USG).
- 24/7 automated clinical pathology laboratory with external quality assurance.
- Modular operating theaters with laminar airflow and HEPA filtration.
- 24/7 in-house pharmacy stocking essential critical-care medicines.
- Advanced life support (ALS) and basic life support (BLS) ambulance fleet.

---

## 6. Patient Appointment Booking Flow
- **Direct Online Booking:** ${SITE_URL}/doctors
- **No Login Required:** Patients book with Name, Phone, Date of Birth, and desired OPD slot.
- **Payment Policy:** No advance fee online; consultation fees are settled at hospital registration upon arrival.
- **Confirmation Reference:** Instant reference ID (\`SCH-YYYY-XXXXX\`) generated with a downloadable PDF appointment slip.
`;

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err: any) {
    return new NextResponse("Error generating LLM full manifest", { status: 500 });
  }
}
