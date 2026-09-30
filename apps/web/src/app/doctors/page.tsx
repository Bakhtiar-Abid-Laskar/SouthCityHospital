import type { Metadata } from "next";
import { DoctorsClient } from "./DoctorsClient";

import { SITE_URL } from "@/data/hospital";

export const metadata: Metadata = {
  title: "Specialist Doctors in Silchar | South City Hospital",
  description:
    "Find and consult leading doctors at South City Hospital in Silchar across 13 clinical specialties. View OPD schedules, doctor qualifications, and book appointments online.",
  alternates: {
    canonical: `${SITE_URL}/doctors`,
  },
  openGraph: {
    title: "Specialist Doctors in Silchar | South City Hospital",
    description:
      "Find and consult leading doctors at South City Hospital in Silchar across 13 clinical specialties. View OPD schedules, doctor qualifications, and book appointments online.",
    url: `${SITE_URL}/doctors`,
    siteName: "South City Hospital",
    locale: "en_IN",
    type: "website",
  },
};

export default function DoctorsPage() {
  return <DoctorsClient />;
}
