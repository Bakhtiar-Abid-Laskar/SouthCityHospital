import type { Appointment } from "@sch/types";

/**
 * Parses appointment date and slot into ISO date-time range in UTC format for calendar services.
 * Assumes Indian Standard Time (UTC+05:30).
 */
function getEventDates(dateStr: string, slotStr?: string | null): { startUtc: string; endUtc: string } {
  // Base date (YYYY-MM-DD)
  const [year, month, day] = dateStr.split("-").map((v) => parseInt(v, 10));

  let startHour = 10;
  let startMinute = 0;
  const durationMinutes = 30;

  if (slotStr) {
    // Try to extract time like "09:00 AM" or "09:00" or "02:30 PM"
    const match = slotStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const meridian = match[3]?.toUpperCase();

      if (meridian === "PM" && h < 12) h += 12;
      if (meridian === "AM" && h === 12) h = 0;

      startHour = h;
      startMinute = m;
    }
  }

  // Create Date object in local IST time (UTC+5.5)
  // Date constructor with year, monthIndex, day, hour, min
  const startDate = new Date(Date.UTC(year, month - 1, day, startHour - 5, startMinute - 30));
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const formatUtc = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  return {
    startUtc: formatUtc(startDate),
    endUtc: formatUtc(endDate),
  };
}

/**
 * Builds a direct Google Calendar Event creation URL.
 */
export function buildGoogleCalendarUrl(appointment: Appointment): string {
  const { startUtc, endUtc } = getEventDates(appointment.preferredDate, appointment.preferredTimeSlot);

  const title = `Doctor Appointment with ${appointment.doctorName}`;
  const details = [
    `Patient: ${appointment.patientName}`,
    `Booking Reference ID: ${appointment.bookingReference}`,
    `Department: ${appointment.departmentName}`,
    `Hospital: South City Hospital, Meherpur, Silchar`,
    `24/7 Helpline: +91 6901271223`,
  ].join("\n");
  const location = "South City Hospital, Meherpur, Silchar, Assam 788015";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startUtc}/${endUtc}`,
    details: details,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates and triggers download of a standardized .ics iCalendar file for Apple Calendar & Microsoft Outlook.
 */
export function downloadIcsCalendarFile(appointment: Appointment): void {
  const { startUtc, endUtc } = getEventDates(appointment.preferredDate, appointment.preferredTimeSlot);
  const nowUtc = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  const summary = `Doctor Consultation: ${appointment.doctorName} (${appointment.departmentName})`;
  const description = `Patient: ${appointment.patientName}\\nBooking Ref: ${appointment.bookingReference}\\nDepartment: ${appointment.departmentName}\\nHospital: South City Hospital, Silchar\\nEmergency / Helpdesk: +91 6901271223`;
  const location = `South City Hospital, Meherpur, Silchar, Assam 788015`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//South City Hospital//Appointment Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:sch-booking-${appointment.bookingReference}@southcityhospital.in`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: Appointment with ${appointment.doctorName} in 2 hours`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `appointment-${appointment.bookingReference}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
