import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { SITE_URL } from "@/data/hospital";

import { JsonLd } from "@/components/seo/JsonLd";
import { buildHospitalSchema } from "@/lib/doctor-schema";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || SITE_URL),
  title: {
    default: "South City Hospital — Multi-Specialty Hospital in Silchar, Assam",
    template: "%s | South City Hospital",
  },
  description:
    "South City Hospital in Silchar, Assam features 13 clinical departments, 13 diagnostic facilities, and round-the-clock emergency care for the Barak Valley.",
  keywords: [
    "South City Hospital",
    "hospital Silchar",
    "doctor booking Silchar",
    "emergency hospital Silchar",
    "multi-specialty hospital Assam",
    "Barak Valley hospital",
    "Meherpur hospital",
    "best hospital in Silchar",
  ],
  authors: [{ name: "South City Hospital" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "South City Hospital",
    title: "South City Hospital — Multi-Specialty Healthcare in Silchar",
    description:
      "South City Hospital in Silchar, Assam features 13 clinical departments, 13 diagnostic facilities, and round-the-clock emergency care for the Barak Valley.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "South City Hospital Silchar - Multi-Specialty Healthcare & 24/7 Emergency Care",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "South City Hospital — Multi-Specialty Healthcare in Silchar",
    description:
      "South City Hospital in Silchar, Assam features 13 clinical departments, 13 diagnostic facilities, and round-the-clock emergency care for the Barak Valley.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "South City Hospital Silchar - Multi-Specialty Healthcare & 24/7 Emergency Care",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "TODO_GOOGLE_SITE_VERIFICATION",
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "TODO_BING_SITE_VERIFICATION",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#1a4f8a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hospitalSchema = buildHospitalSchema();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfair.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <JsonLd data={hospitalSchema} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
