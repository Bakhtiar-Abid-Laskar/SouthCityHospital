"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { StaggerReveal, StaggerItem, itemVariants } from "./motion";
import { cn } from "@/lib/utils";
import { fetchGalleryImages } from "@/services/gallery";

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  title: string;
  width: number;
  height: number;
}

// Mock Data for the gallery
// This can be easily replaced with an API fetch call later.
export const MOCK_IMAGES: GalleryImage[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
    alt: "Modern hospital exterior view during the day",
    title: "South City Hospital Building",
    width: 2053,
    height: 1369,
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2000&auto=format&fit=crop",
    alt: "Advanced operating room with modern equipment",
    title: "State-of-the-art Surgery Center",
    width: 2000,
    height: 3000,
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop",
    alt: "Comfortable and clean patient recovery room",
    title: "Patient Recovery Rooms",
    width: 2070,
    height: 1380,
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop",
    alt: "Medical team discussing patient charts",
    title: "Dedicated Medical Professionals",
    width: 2070,
    height: 1380,
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop",
    alt: "Modern medical laboratory with microscopes",
    title: "Advanced Diagnostics Lab",
    width: 2080,
    height: 3120,
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=2070&auto=format&fit=crop",
    alt: "Welcoming reception area and waiting room",
    title: "Reception Area",
    width: 2070,
    height: 1380,
  }
];

interface ImageGalleryProps {
  images?: GalleryImage[];
  className?: string;
}

export function ImageGallery({ images: propImages, className }: ImageGalleryProps) {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(propImages || MOCK_IMAGES);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    if (!propImages) {
      fetchGalleryImages().then((imgs) => {
        if (imgs && imgs.length > 0) {
          setGalleryImages(imgs);
        }
      });
    }
  }, [propImages]);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };

    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedImage]);

  return (
    <div className={cn("w-full", className)}>
      {/* Masonry Grid */}
      <StaggerReveal className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {galleryImages.map((img) => (
          <StaggerItem 
            key={img.id} 
            variants={itemVariants}
            className="break-inside-avoid relative group cursor-pointer block"
            onClick={() => setSelectedImage(img)}
          >
            <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-[var(--cloud)] shadow-card transition-all duration-300 group-hover:shadow-hover border border-transparent group-hover:border-[var(--blue-500)]/30">
              <Image
                src={img.url}
                alt={img.alt}
                width={img.width}
                height={img.height}
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              
              {/* Photo Caption Overlay (Persistent on Touch, Hover on Desktop) */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--blue-950)]/90 via-[var(--blue-950)]/25 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-6">
                <div className="transform translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-300 ease-out flex items-end justify-between gap-3 sm:gap-4">
                  <div>
                    <h3 className="font-display text-white text-base sm:text-lg font-semibold leading-tight">
                      {img.title}
                    </h3>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shrink-0 shadow-lg transform rotate-[-10deg] group-hover:rotate-0 transition-transform duration-300">
                    <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerReveal>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-8 bg-[var(--blue-950)]/95 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 sm:top-6 sm:right-6 p-2.5 text-white/80 hover:text-white bg-white/15 hover:bg-white/25 rounded-full transition-colors z-20 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl h-full max-h-[88vh] sm:max-h-[85vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full flex-1 min-h-[220px]">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  fill
                  sizes="(max-width: 1280px) 100vw, 1200px"
                  className="object-contain"
                  priority
                />
              </div>
              
              <motion.div 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-3 sm:mt-6 text-center max-w-2xl shrink-0 px-2"
              >
                <h3 className="text-white font-display text-lg sm:text-2xl font-semibold mb-1 sm:mb-2">
                  {selectedImage.title}
                </h3>
                <p className="text-[var(--cloud)]/80 text-xs sm:text-sm">
                  {selectedImage.alt}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

