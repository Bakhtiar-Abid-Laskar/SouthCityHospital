import type { Metadata } from "next";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { ScrollReveal } from "@/components/ui/motion";
import { CtaBand } from "@/components/home/CtaBand";
import { FloatingBlobs, PulseLineWatermark } from "@/components/ui/svg-patterns";

export const metadata: Metadata = {
  title: "Infrastructure & Photo Gallery",
  description:
    "Tour our modern clinical infrastructure, operation theaters, diagnostic imaging centers, and patient recovery facilities in Meherpur, Silchar, Assam.",
  alternates: {
    canonical: "https://southcityhospital.in/gallery",
  },
};

export default function GalleryPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-20 relative overflow-hidden bg-hero-gradient" aria-label="Gallery hero">
        <FloatingBlobs />
        <PulseLineWatermark />
        <div className="container-site relative z-10">
          <ScrollReveal className="max-w-xl">
            <p className="eyebrow text-[var(--accent)] mb-4">Our Facilities</p>
            <h1 className="font-display text-display-xl text-white mb-4">
              Photo Gallery
            </h1>
            <p className="text-white/75 text-lg">
              Take a visual tour of our state-of-the-art facilities, advanced medical equipment, and comfortable patient care environments.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-[var(--section-y)]" style={{ background: "var(--white)" }} aria-labelledby="gallery-grid-heading">
        <div className="container-site">
          <div className="mb-6 sm:mb-8">
            <h2 id="gallery-grid-heading" className="font-display text-display-sm text-[var(--primary-dark)]">
              Hospital Campus & Facilities
            </h2>
            <p className="text-xs sm:text-sm text-[var(--slate)] mt-1">
              Explore high-resolution photographs of our operating theaters, inpatient wards, and diagnostic units.
            </p>
          </div>
          <ImageGallery />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
