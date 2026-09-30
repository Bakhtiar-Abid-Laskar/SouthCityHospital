"use client";

import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { Phone, CalendarCheck } from "lucide-react";
import { hospital } from "@/data/hospital";

const CookieConsent = dynamic(
  () => import("@/components/ui/CookieConsent").then((mod) => mod.CookieConsent),
  { ssr: false }
);

const StayUpdatedModal = dynamic(
  () => import("@/components/ui/StayUpdatedModal").then((mod) => mod.StayUpdatedModal),
  { ssr: false }
);

function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="pb-24 lg:pb-0">
        {children}
      </main>
      <Footer />

      {/* Sticky Mobile Actions Bar */}
      <div 
        className="fixed bottom-4 sm:bottom-6 inset-x-3 sm:inset-x-4 z-40 lg:hidden flex items-center justify-between pointer-events-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* 24/7 Emergency Call */}
        <a
          href={`tel:${hospital.contact.emergency.replace(/\s/g, "")}`}
          className="pointer-events-auto flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 text-white text-xs sm:text-sm font-semibold rounded-full shadow-[var(--shadow-overlay)] transition-transform hover:scale-105 active:scale-95 border border-white/10"
          style={{ background: "var(--emergency)" }}
          aria-label={`Call emergency: ${hospital.contact.emergency}`}
        >
          <Phone size={15} aria-hidden="true" />
          <span>Emergency</span>
        </a>

        {/* Book Doctor CTA */}
        <Link
          href="/doctors"
          className="pointer-events-auto flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 text-white text-xs sm:text-sm font-semibold rounded-full shadow-[var(--shadow-overlay)] transition-transform hover:scale-105 active:scale-95 bg-[var(--primary)] border border-white/15"
          aria-label="Book doctor appointment"
        >
          <CalendarCheck size={15} aria-hidden="true" />
          <span>Book Doctor</span>
        </Link>
      </div>

      {/* Global Cookie & Privacy Notice */}
      <CookieConsent />

      {/* Stay Updated registration popup */}
      <StayUpdatedModal />
    </>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReactQueryProvider>
      <AppShell>{children}</AppShell>
    </ReactQueryProvider>
  );
}
