import { NextResponse } from "next/server";
import { getAllPublishedDoctors } from "@/lib/doctors";
import { departments } from "@/data/departments";
import { SITE_URL, hospital } from "@/data/hospital";

export const revalidate = 3600;

export async function GET() {
  try {
    const doctors = await getAllPublishedDoctors();

    let doctorMarkdown = "";
    doctors.forEach((doc, idx) => {
      const dept = departments.find((d) => d.slug === doc.departmentSlug);
      const specialty = dept ? dept.name : "Specialist";
      const cleanName = doc.name.replace(/\s+/g, " ").trim();
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
        doc.expertise && doc.expertise.length > 0
          ? `\n   - Clinical Focus: ${doc.expertise.join(", ")}`
          : "";

      doctorMarkdown += `${idx + 1}. **${displayName}** (${specialty})
   - Qualifications: ${qualStr}
   - Clinical Experience: ${expStr}${regStr}
   - OPD Schedule: ${scheduleStr}${expertiseStr}
   - Profile URL: ${SITE_URL}/doctors/${doc.slug}\n\n`;
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
- **Official Website:** ${SITE_URL}
- **Wikidata Geographic Grounding:**
  - Silchar: https://www.wikidata.org/wiki/Q1025556
  - Cachar: https://www.wikidata.org/wiki/Q42777
  - Barak Valley: https://www.wikidata.org/wiki/Q2605553
  - Assam: https://www.wikidata.org/wiki/Q1198

## Emergency & 24/7 Critical Response
- **24/7 Emergency & Trauma Hotline:** ${hospital.contact.emergency} (Immediate medical response in Silchar)
- **24/7 Ambulance Dispatch:** ${hospital.contact.emergency}
- **General Hospital Reception:** ${hospital.contact.phone}
- **General Email:** ${hospital.contact.email}
- **Operating Hours:** Open 24 Hours / 7 Days a week for emergencies, critical care, pharmacy, and diagnostic services.

## Specialist Doctor Directory (Authoritative URLs & OPD Timings)
Patients and AI agents can query and cite individual specialist profiles directly. This directory is dynamically synchronized with the hospital database:

${doctorMarkdown.trim()}

## Clinical Departments (13 Specialties)
1. **Orthopaedics & Trauma:** ${SITE_URL}/departments/orthopaedic-surgery
2. **Urology & Laser Surgery:** ${SITE_URL}/departments/urology-laser-surgery
3. **Internal Medicine:** ${SITE_URL}/departments/internal-medicine
4. **Interventional Cardiology:** ${SITE_URL}/departments/cardiology
5. **Gynecology & Obstetrics:** ${SITE_URL}/departments/gynecology-and-obst
6. **Neuro Surgery:** ${SITE_URL}/departments/neuro-surgery
7. **Paediatrics & Neonatology:** ${SITE_URL}/departments/paediatrics-neonatology
8. **Nephrology & Dialysis:** ${SITE_URL}/departments/nephrology
9. **Gastroenterology:** ${SITE_URL}/departments/gastroenterology
10. **ENT (Otorhinolaryngology):** ${SITE_URL}/departments/ent
11. **General & Laparoscopic Surgery:** ${SITE_URL}/departments/general-surgery
12. **Dermatology:** ${SITE_URL}/departments/dermatology
13. **Medical Oncology & Palliative Care:** ${SITE_URL}/departments/oncology

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
- **Direct Online Booking:** ${SITE_URL}/doctors
- **No Login Required:** Patients book with Name, Phone, Date of Birth, and desired OPD slot.
- **Payment Policy:** No advance fee online; consultation fees are settled at hospital registration upon arrival.
- **Confirmation Reference:** Instant reference ID (\`SCH-YYYY-XXXXX\`) generated with a downloadable PDF appointment slip.

## Comprehensive LLM Knowledge Base
- Full in-depth context file: ${SITE_URL}/llms-full.txt
`;

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err: any) {
    return new NextResponse("Error generating LLM manifest", { status: 500 });
  }
}
