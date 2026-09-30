import type { Appointment } from "@sch/types";
import { formatDisplayDate } from "./date-utils";
import { hospital, SITE_URL } from "@/data/hospital";

/**
 * Generates and triggers the download of an authoritative, branded South City Hospital appointment PDF slip.
 * Clearly features the official hospital address, reception phone, and 24/7 emergency numbers.
 */
export async function downloadBookingSlipPdf(appointment: Appointment): Promise<void> {
  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions in points
  const { width, height } = page.getSize();

  // Color Palette
  const navy = rgb(10 / 255, 37 / 255, 64 / 255); // #0A2540
  const navyDark = rgb(6 / 255, 23 / 255, 40 / 255); // #061728
  const gold = rgb(201 / 255, 161 / 255, 92 / 255); // #C9A15C
  const goldLight = rgb(245 / 255, 235 / 255, 215 / 255);
  const darkInk = rgb(30 / 255, 41 / 255, 59 / 255); // #1E293B
  const slate = rgb(100 / 255, 116 / 255, 139 / 255); // #64748B
  const lightBg = rgb(244 / 255, 247 / 255, 251 / 255); // #F4F7FB
  const emerald = rgb(16 / 255, 149 / 255, 106 / 255); // #10956A
  const emeraldBg = rgb(236 / 255, 253 / 255, 245 / 255);
  const borderGray = rgb(226 / 255, 232 / 255, 240 / 255);
  const white = rgb(1, 1, 1);
  const lightBlue = rgb(215 / 255, 230 / 255, 250 / 255);

  // Fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // 1. Decorative Top Accent Bar (Gold)
  page.drawRectangle({
    x: 0,
    y: height - 6,
    width: width,
    height: 6,
    color: gold,
  });

  // 2. Hospital Header Banner (Navy)
  const headerHeight = 106;
  page.drawRectangle({
    x: 0,
    y: height - 6 - headerHeight,
    width: width,
    height: headerHeight,
    color: navy,
  });

  // Hospital Name & Subtitle
  page.drawText("SOUTH CITY HOSPITAL", {
    x: 40,
    y: height - 42,
    size: 21,
    font: helveticaBold,
    color: white,
  });

  page.drawText("MULTI-SPECIALTY HEALTHCARE & 24/7 CRITICAL CARE CENTRE", {
    x: 40,
    y: height - 58,
    size: 8.5,
    font: helveticaBold,
    color: gold,
  });

  // Prominent Header Address & Phone
  page.drawText(`Address: ${hospital.location.address}`, {
    x: 40,
    y: height - 76,
    size: 9.5,
    font: helveticaBold,
    color: white,
  });

  page.drawText(
    `Phone: ${hospital.contact.phone}   |   24/7 Emergency & Ambulance: ${hospital.contact.emergency}`,
    {
      x: 40,
      y: height - 92,
      size: 9.5,
      font: helveticaBold,
      color: lightBlue,
    }
  );

  page.drawText(
    `Email: ${hospital.contact.email}   |   Website: ${hospital.domain}`,
    {
      x: 40,
      y: height - 105,
      size: 8.5,
      font: helvetica,
      color: rgb(180 / 255, 205 / 255, 235 / 255),
    }
  );

  // Header Badge (Right aligned)
  const badgeRightX = width - 185;
  page.drawRectangle({
    x: badgeRightX,
    y: height - 52,
    width: 145,
    height: 24,
    color: navyDark,
    borderColor: gold,
    borderWidth: 1,
  });

  page.drawText("APPOINTMENT SLIP", {
    x: badgeRightX + 16,
    y: height - 44,
    size: 10,
    font: helveticaBold,
    color: gold,
  });

  // 3. Prominent Reference ID & Status Card
  const refCardY = height - 186;
  page.drawRectangle({
    x: 40,
    y: refCardY,
    width: width - 80,
    height: 60,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText("BOOKING REFERENCE NUMBER", {
    x: 56,
    y: refCardY + 41,
    size: 8.5,
    font: helveticaBold,
    color: slate,
  });

  page.drawText(appointment.bookingReference, {
    x: 56,
    y: refCardY + 16,
    size: 19,
    font: courierBold,
    color: navy,
  });

  // Status Badge
  const statusBadgeX = width - 185;
  const statusBadgeY = refCardY + 16;
  page.drawRectangle({
    x: statusBadgeX,
    y: statusBadgeY,
    width: 125,
    height: 28,
    color: emeraldBg,
    borderColor: emerald,
    borderWidth: 1,
  });

  page.drawText("STATUS: CONFIRMED", {
    x: statusBadgeX + 10,
    y: statusBadgeY + 9,
    size: 9,
    font: helveticaBold,
    color: emerald,
  });

  // 4. Section: Consultation Details
  let currentY = refCardY - 30;
  page.drawText("CONSULTATION DETAILS", {
    x: 40,
    y: currentY,
    size: 11,
    font: helveticaBold,
    color: navy,
  });

  currentY -= 6;
  page.drawLine({
    start: { x: 40, y: currentY },
    end: { x: width - 40, y: currentY },
    thickness: 1,
    color: gold,
  });

  currentY -= 22;
  page.drawText("Consulting Doctor:", { x: 40, y: currentY, size: 9.5, font: helvetica, color: slate });
  page.drawText(appointment.doctorName, { x: 175, y: currentY, size: 10.5, font: helveticaBold, color: darkInk });

  currentY -= 17;
  page.drawText("Department / Specialty:", { x: 40, y: currentY, size: 9.5, font: helvetica, color: slate });
  page.drawText(appointment.departmentName, { x: 175, y: currentY, size: 10, font: helveticaBold, color: darkInk });

  currentY -= 17;
  page.drawText("Appointment Date:", { x: 40, y: currentY, size: 9.5, font: helvetica, color: slate });
  page.drawText(formatDisplayDate(appointment.preferredDate), { x: 175, y: currentY, size: 10, font: helveticaBold, color: navy });

  currentY -= 17;
  page.drawText("Consultation Window:", { x: 40, y: currentY, size: 9.5, font: helvetica, color: slate });
  page.drawText(appointment.preferredTimeSlot || "Hospital OPD Hours", { x: 175, y: currentY, size: 10, font: helveticaBold, color: darkInk });

  // 5. Section: Patient Details
  currentY -= 26;
  page.drawText("PATIENT INFORMATION", {
    x: 40,
    y: currentY,
    size: 11,
    font: helveticaBold,
    color: navy,
  });

  currentY -= 6;
  page.drawLine({
    start: { x: 40, y: currentY },
    end: { x: width - 40, y: currentY },
    thickness: 1,
    color: borderGray,
  });

  currentY -= 22;
  page.drawText("Patient Full Name:", { x: 40, y: currentY, size: 9.5, font: helvetica, color: slate });
  page.drawText(appointment.patientName, { x: 175, y: currentY, size: 10, font: helveticaBold, color: darkInk });

  currentY -= 17;
  page.drawText("Patient Contact Phone:", { x: 40, y: currentY, size: 9.5, font: helvetica, color: slate });
  page.drawText(appointment.patientPhone, { x: 175, y: currentY, size: 10, font: helveticaBold, color: darkInk });

  currentY -= 17;
  page.drawText("Date of Birth:", { x: 40, y: currentY, size: 9.5, font: helvetica, color: slate });
  page.drawText(appointment.patientDob, { x: 175, y: currentY, size: 10, font: helvetica, color: darkInk });

  if (appointment.message) {
    currentY -= 17;
    page.drawText("Patient Note / Symptoms:", { x: 40, y: currentY, size: 9.5, font: helvetica, color: slate });
    page.drawText(appointment.message.substring(0, 70), { x: 175, y: currentY, size: 9.5, font: helvetica, color: darkInk });
  }

  // 6. Section: DEDICATED PROMINENT HOSPITAL LOCATION & CONTACT CARD
  currentY -= 28;
  const hospitalCardHeight = 84;
  const hospitalCardY = currentY - hospitalCardHeight;

  // Box Background
  page.drawRectangle({
    x: 40,
    y: hospitalCardY,
    width: width - 80,
    height: hospitalCardHeight,
    color: lightBg,
    borderColor: navy,
    borderWidth: 1.2,
  });

  // Top header bar inside the box
  page.drawRectangle({
    x: 40,
    y: hospitalCardY + hospitalCardHeight - 20,
    width: width - 80,
    height: 20,
    color: navy,
  });

  page.drawText("HOSPITAL LOCATION & CONTACT DIRECTORY", {
    x: 54,
    y: hospitalCardY + hospitalCardHeight - 14,
    size: 8.5,
    font: helveticaBold,
    color: gold,
  });

  // Left Column: Physical Location & Landmark
  const col1X = 54;
  page.drawText("Hospital Facility:", {
    x: col1X,
    y: hospitalCardY + 48,
    size: 8.5,
    font: helveticaBold,
    color: darkInk,
  });
  page.drawText("South City Hospital (OPD & Emergency)", {
    x: col1X + 85,
    y: hospitalCardY + 48,
    size: 8.5,
    font: helvetica,
    color: darkInk,
  });

  page.drawText("Full Address:", {
    x: col1X,
    y: hospitalCardY + 32,
    size: 8.5,
    font: helveticaBold,
    color: darkInk,
  });
  page.drawText("Meherpur, Silchar, Cachar, Assam – 788015", {
    x: col1X + 85,
    y: hospitalCardY + 32,
    size: 8.5,
    font: helveticaBold,
    color: navy,
  });

  page.drawText("Landmark:", {
    x: col1X,
    y: hospitalCardY + 16,
    size: 8.5,
    font: helveticaBold,
    color: darkInk,
  });
  page.drawText("Main Meherpur Road, Silchar (Near SMC Corridor)", {
    x: col1X + 85,
    y: hospitalCardY + 16,
    size: 8.5,
    font: helvetica,
    color: slate,
  });

  // Right Column: Direct Contact & Emergency Phone
  const col2X = 350;
  page.drawText("Hospital Reception:", {
    x: col2X,
    y: hospitalCardY + 48,
    size: 8.5,
    font: helveticaBold,
    color: darkInk,
  });
  page.drawText(hospital.contact.phone, {
    x: col2X + 90,
    y: hospitalCardY + 48,
    size: 9,
    font: helveticaBold,
    color: navy,
  });

  page.drawText("24/7 Emergency:", {
    x: col2X,
    y: hospitalCardY + 32,
    size: 8.5,
    font: helveticaBold,
    color: rgb(180 / 255, 30 / 255, 30 / 255), // emergency red
  });
  page.drawText(`${hospital.contact.emergency} (Ambulance)`, {
    x: col2X + 90,
    y: hospitalCardY + 32,
    size: 9,
    font: helveticaBold,
    color: rgb(180 / 255, 30 / 255, 30 / 255),
  });

  page.drawText("Hospital Email:", {
    x: col2X,
    y: hospitalCardY + 16,
    size: 8.5,
    font: helveticaBold,
    color: darkInk,
  });
  page.drawText(hospital.contact.email, {
    x: col2X + 90,
    y: hospitalCardY + 16,
    size: 8,
    font: helvetica,
    color: slate,
  });

  // 7. Section: Important Patient Instructions Box
  currentY = hospitalCardY - 18;
  const instHeight = 88;
  const instY = currentY - instHeight;

  page.drawRectangle({
    x: 40,
    y: instY,
    width: width - 80,
    height: instHeight,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText("IMPORTANT PATIENT CHECK-IN INSTRUCTIONS:", {
    x: 54,
    y: instY + instHeight - 16,
    size: 8.5,
    font: helveticaBold,
    color: navy,
  });

  const instructions = [
    "1. Reporting Time: Please arrive at South City Hospital 15 minutes prior to your scheduled consultation window.",
    "2. Registration Desk: Show this slip or quote your Booking Reference ID at the main hospital reception in Meherpur.",
    "3. No Advance Online Fee: Consultation charges are settled directly at the hospital registration counter on arrival.",
    `4. Inquiries & Directions: Call hospital reception at ${hospital.contact.phone} or emergency desk at ${hospital.contact.emergency}.`,
  ];

  let lineY = instY + instHeight - 32;
  for (const line of instructions) {
    page.drawText(line, {
      x: 54,
      y: lineY,
      size: 8,
      font: helvetica,
      color: darkInk,
    });
    lineY -= 14;
  }

  // 8. Hospital Footer
  const footerHeight = 44;
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: footerHeight,
    color: navy,
  });

  page.drawText(
    `South City Hospital  ·  ${hospital.location.address}  ·  Phone: ${hospital.contact.phone}  ·  24/7 Helpline: ${hospital.contact.emergency}`,
    {
      x: 40,
      y: 24,
      size: 8.5,
      font: helveticaBold,
      color: lightBlue,
    }
  );

  page.drawText(
    "Generated electronically by South City Hospital Online Appointment System. No physical signature required.",
    {
      x: 40,
      y: 11,
      size: 7.5,
      font: helvetica,
      color: rgb(150 / 255, 175 / 255, 205 / 255),
    }
  );

  // Save and trigger download in browser
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SouthCityHospital_Booking_${appointment.bookingReference}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
