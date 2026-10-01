import type { Metadata } from "next";
import { DoctorsClient } from "./DoctorsClient";
import { getAllPublishedDoctors } from "@/lib/doctors";
import { SITE_URL, hospital } from "@/data/hospital";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 3600; // 1-hour ISR cache

export const metadata: Metadata = {
  title: "Specialist Doctors in Silchar | South City Hospital",
  description:
    "Find and consult leading doctors at South City Hospital in Silchar across 13 clinical specialties. View OPD schedules, doctor qualifications, and book appointments online.",
  keywords: [
    "Doctors in Silchar",
    "Specialist doctors Silchar",
    "South City Hospital doctors",
    "Silchar doctor chamber",
    "OPD schedule Silchar",
    "Orthopaedic doctor Silchar",
    "Urologist in Silchar",
    "Gynecologist Silchar",
    "Medicine specialist Silchar",
    "Doctor appointment Silchar",
    "Barak Valley doctors",
    "Assam hospital doctors",
  ],
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
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "South City Hospital Specialist Doctors Directory, Silchar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Specialist Doctors in Silchar | South City Hospital",
    description:
      "Find and consult leading doctors at South City Hospital in Silchar. View chamber timings and book online.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
  other: {
    "geo.region": "IN-AS",
    "geo.placename": "Silchar, Cachar, Assam",
    "geo.position": `${hospital.location.geo.latitude};${hospital.location.geo.longitude}`,
    "ICBM": `${hospital.location.geo.latitude}, ${hospital.location.geo.longitude}`,
    "DC.title": "Specialist Doctors in Silchar | South City Hospital",
    "DC.creator": "South City Hospital, Silchar",
  },
};

export default async function DoctorsPage() {
  const initialDoctors = await getAllPublishedDoctors();

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Specialist Doctors at South City Hospital, Silchar",
    description:
      "Directory of certified medical consultants and specialists at South City Hospital in Meherpur, Silchar, Assam.",
    itemListElement: initialDoctors.map((doc, idx) => {
      const cleanName = doc.name.replace(/\s+/g, " ").trim();
      const displayName = cleanName.startsWith("Dr.") ? cleanName : `Dr. ${cleanName}`;
      return {
        "@type": "ListItem",
        position: idx + 1,
        name: displayName,
        url: `${SITE_URL}/doctors/${doc.slug}`,
      };
    }),
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      <DoctorsClient initialDoctors={initialDoctors} />
    </>
  );
}

