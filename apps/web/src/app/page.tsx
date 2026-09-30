import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { CoreValuesSection } from "@/components/home/CoreValuesSection";
import { DepartmentsHighlight } from "@/components/home/DepartmentsHighlight";
import { FacilitiesHighlight } from "@/components/home/FacilitiesHighlight";
import { DoctorsHighlight } from "@/components/home/DoctorsHighlight";
import { TestimonialsHighlight } from "@/components/home/TestimonialsHighlight";
import { AboutSection } from "@/components/home/AboutSection";
import { CtaBand } from "@/components/home/CtaBand";
import { FaqHighlight } from "@/components/home/FaqHighlight";

export const metadata: Metadata = {
  title: {
    absolute: "South City Hospital — Multi-Specialty Hospital in Silchar",
  },
  description:
    "South City Hospital in Silchar, Assam offers 13 clinical departments, advanced diagnostics, and 24/7 critical emergency care. Book your consultation today.",
  alternates: {
    canonical: "https://southcityhospital.in",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CoreValuesSection />
      <DepartmentsHighlight />
      <AboutSection />
      <FacilitiesHighlight />
      <DoctorsHighlight />
      <TestimonialsHighlight />
      <FaqHighlight />
      <CtaBand />
    </>
  );
}
