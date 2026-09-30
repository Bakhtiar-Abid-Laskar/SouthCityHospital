import type { Metadata } from "next";
import { DoctorsClient } from "./DoctorsClient";

export const metadata: Metadata = {
  title: "Specialist Doctors in Silchar",
  description:
    "Find and consult leading doctors at South City Hospital, Silchar across 13 clinical specialties. View schedules and book your consultation online today.",
  alternates: {
    canonical: "https://southcityhospital.in/doctors",
  },
};

export default function DoctorsPage() {
  return <DoctorsClient />;
}
