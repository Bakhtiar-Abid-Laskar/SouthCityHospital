import type { Appointment } from "@sch/types";
import { formatDisplayDate } from "./date-utils";
import { hospital } from "@/data/hospital";

/**
 * Generates and triggers the download of a branded South City Hospital appointment PDF slip.
 */
export async function downloadBookingSlipPdf(appointment: Appointment): Promise<void> {
  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions in points
  const { width, height } = page.getSize();

  // Colors
  const navy = rgb(10 / 255, 37 / 255, 64 / 255); // #0A2540
  const gold = rgb(201 / 255, 161 / 255, 92 / 255); // #C9A15C
  const darkInk = rgb(30 / 255, 41 / 255, 59 / 255);
  const slate = rgb(100 / 255, 116 / 255, 139 / 255);
  const lightBg = rgb(244 / 255, 247 / 255, 251 / 255);
  const emerald = rgb(16 / 255, 149 / 255, 106 / 255);
  const borderGray = rgb(226 / 255, 232 / 255, 240 / 255);

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

  // 2. Hospital Header (Navy)
  page.drawRectangle({
    x: 0,
    y: height - 94,
    width: width,
    height: 88,
    color: navy,
  });

  page.drawText("SOUTH CITY HOSPITAL", {
    x: 40,
    y: height - 48,
    size: 20,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`${hospital.location.address}  |  Emergency: ${hospital.contact.emergency} (24/7)`, {
    x: 40,
    y: height - 70,
    size: 10,
    font: helvetica,
    color: rgb(215 / 255, 225 / 255, 240 / 255),
  });

  page.drawText("OFFICIAL APPOINTMENT SLIP", {
    x: width - 210,
    y: height - 48,
    size: 11,
    font: helveticaBold,
    color: gold,
  });

  // 3. Prominent Reference ID & Status Card
  const refCardY = height - 180;
  page.drawRectangle({
    x: 40,
    y: refCardY,
    width: width - 80,
    height: 65,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText("BOOKING REFERENCE NUMBER", {
    x: 58,
    y: refCardY + 44,
    size: 9,
    font: helveticaBold,
    color: slate,
  });

  page.drawText(appointment.bookingReference, {
    x: 58,
    y: refCardY + 16,
    size: 20,
    font: courierBold,
    color: navy,
  });

  // Status Badge
  const badgeX = width - 185;
  const badgeY = refCardY + 18;
  page.drawRectangle({
    x: badgeX,
    y: badgeY,
    width: 125,
    height: 28,
    color: rgb(236 / 255, 253 / 255, 245 / 255),
    borderColor: emerald,
    borderWidth: 1,
  });

  page.drawText("STATUS: CONFIRMED", {
    x: badgeX + 10,
    y: badgeY + 9,
    size: 9,
    font: helveticaBold,
    color: emerald,
  });

  // 4. Section: Consultation Details
  let currentY = height - 215;
  page.drawText("CONSULTATION DETAILS", {
    x: 40,
    y: currentY,
    size: 12,
    font: helveticaBold,
    color: navy,
  });

  currentY -= 8;
  page.drawLine({
    start: { x: 40, y: currentY },
    end: { x: width - 40, y: currentY },
    thickness: 1,
    color: gold,
  });

  currentY -= 28;

  // Doctor Details
  page.drawText("Consulting Doctor:", { x: 40, y: currentY, size: 10, font: helvetica, color: slate });
  page.drawText(appointment.doctorName, { x: 170, y: currentY, size: 11, font: helveticaBold, color: darkInk });

  currentY -= 20;
  page.drawText("Department:", { x: 40, y: currentY, size: 10, font: helvetica, color: slate });
  page.drawText(appointment.departmentName, { x: 170, y: currentY, size: 10, font: helveticaBold, color: darkInk });

  currentY -= 20;
  page.drawText("Appointment Date:", { x: 40, y: currentY, size: 10, font: helvetica, color: slate });
  page.drawText(formatDisplayDate(appointment.preferredDate), { x: 170, y: currentY, size: 10, font: helveticaBold, color: navy });

  currentY -= 20;
  page.drawText("Consultation Window:", { x: 40, y: currentY, size: 10, font: helvetica, color: slate });
  page.drawText(appointment.preferredTimeSlot || "Hospital OPD Hours", { x: 170, y: currentY, size: 10, font: helveticaBold, color: darkInk });

  // 5. Section: Patient Details
  currentY -= 35;
  page.drawText("PATIENT INFORMATION", {
    x: 40,
    y: currentY,
    size: 12,
    font: helveticaBold,
    color: navy,
  });

  currentY -= 8;
  page.drawLine({
    start: { x: 40, y: currentY },
    end: { x: width - 40, y: currentY },
    thickness: 1,
    color: borderGray,
  });

  currentY -= 28;
  page.drawText("Patient Name:", { x: 40, y: currentY, size: 10, font: helvetica, color: slate });
  page.drawText(appointment.patientName, { x: 170, y: currentY, size: 10, font: helveticaBold, color: darkInk });

  currentY -= 20;
  page.drawText("Contact Phone:", { x: 40, y: currentY, size: 10, font: helvetica, color: slate });
  page.drawText(appointment.patientPhone, { x: 170, y: currentY, size: 10, font: helvetica, color: darkInk });

  currentY -= 20;
  page.drawText("Date of Birth:", { x: 40, y: currentY, size: 10, font: helvetica, color: slate });
  page.drawText(appointment.patientDob, { x: 170, y: currentY, size: 10, font: helvetica, color: darkInk });

  if (appointment.message) {
    currentY -= 20;
    page.drawText("Symptoms / Notes:", { x: 40, y: currentY, size: 10, font: helvetica, color: slate });
    page.drawText(appointment.message.substring(0, 75), { x: 170, y: currentY, size: 10, font: helvetica, color: darkInk });
  }

  // 6. Section: Instructions Box
  currentY -= 40;
  const instHeight = 110;
  page.drawRectangle({
    x: 40,
    y: currentY - instHeight,
    width: width - 80,
    height: instHeight,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText("IMPORTANT PATIENT INSTRUCTIONS:", {
    x: 55,
    y: currentY - 20,
    size: 9,
    font: helveticaBold,
    color: navy,
  });

  const instructions = [
    "1. Please arrive at South City Hospital 15 minutes prior to your consultation slot.",
    "2. Present this reference slip or your Booking ID at the main registration desk in Meherpur.",
    "3. No advance payment was charged. Consultation fees are settled directly at reception.",
    `4. For cancellations or emergency queries, contact our 24/7 helpline at ${hospital.contact.emergency}.`,
  ];

  let instY = currentY - 38;
  for (const line of instructions) {
    page.drawText(line, {
      x: 55,
      y: instY,
      size: 8.5,
      font: helvetica,
      color: darkInk,
    });
    instY -= 17;
  }

  // 7. Footer
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: 45,
    color: navy,
  });

  page.drawText(`South City Hospital  ·  ${hospital.location.address}  ·  ${hospital.contact.email}`, {
    x: 40,
    y: 24,
    size: 9,
    font: helvetica,
    color: rgb(215 / 255, 225 / 255, 240 / 255),
  });

  page.drawText("Generated electronically. No physical signature required.", {
    x: 40,
    y: 11,
    size: 8,
    font: helvetica,
    color: rgb(150 / 255, 170 / 255, 200 / 255),
  });

  // Save and trigger download
  const pdfBytes = await pdfDoc.save();
  // We use a binary array buffer to create the Blob
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
