import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart,
} from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/icons/SocialIcons";
import { hospital } from "@/data/hospital";
import { ScrollReveal } from "@/components/ui/motion";

const QUICK_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/departments", label: "Departments" },
  { href: "/doctors", label: "Our Doctors" },
  { href: "/booking-status", label: "Check Booking Status" },
  { href: "/facilities", label: "Facilities" },
  { href: "/gallery", label: "Photo Gallery" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer
      className="text-white relative"
      style={{
        background: "linear-gradient(to bottom, var(--blue-600) 0%, rgba(22,57,92,1) 40%, var(--blue-950) 100%)",
      }}
      aria-label="Site footer"
    >
      {/* ── Emergency Banner ── */}
      <div
        className="py-5 text-center bg-[var(--emergency)] shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]"
      >
        <p className="text-white text-sm font-semibold flex items-center justify-center gap-2">
          Medical Emergency?{" "}
          <a
            href={`tel:${hospital.contact.emergency.replace(/\s/g, "")}`}
            className="font-mono text-[15px] hover:text-white/80 transition-colors ml-1"
          >
            {hospital.contact.emergency.split(' ')[0]} <span className="underline underline-offset-4 decoration-[1.5px]">{hospital.contact.emergency.split(' ')[1]}</span>
          </a>{" "}
          — Available 24 Hours / 7 Days
        </p>
      </div>

      {/* ── Main Footer Content ── */}
      <h2 className="sr-only">Footer Navigation and Hospital Information</h2>
      <ScrollReveal className="container-site py-14 relative z-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Hospital Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.webp"
              alt="South City Hospital"
              width={48}
              height={48}
              className="rounded-lg object-cover w-12 h-12"
            />
            <div>
              <p className="font-display font-semibold text-lg leading-tight">
                South City Hospital
              </p>
              <p
                className="text-xs leading-tight"
                style={{
                  color: "var(--accent)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {hospital.tagline}
              </p>
            </div>
          </div>

          <p
            className="text-sm leading-relaxed max-w-sm"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            {hospital.about}
          </p>

          {/* Contact Details */}
          <ul className="space-y-2.5" role="list">
            <li>
              <a
                href={`tel:${hospital.contact.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2.5 text-sm hover:text-white transition-colors group"
                style={{ color: "rgba(255,255,255,0.80)" }}
              >
                <Phone
                  size={15}
                  aria-hidden="true"
                  style={{ color: "var(--accent)" }}
                />
                {hospital.contact.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${hospital.contact.email}`}
                className="flex items-center gap-2.5 text-sm hover:text-white transition-colors"
                style={{ color: "rgba(255,255,255,0.80)" }}
              >
                <Mail
                  size={15}
                  aria-hidden="true"
                  style={{ color: "var(--accent)" }}
                />
                {hospital.contact.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.80)" }}>
              <MapPin
                size={15}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                style={{ color: "var(--accent)" }}
              />
              {hospital.location.address}
            </li>
            <li className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.80)" }}>
              <Clock
                size={15}
                aria-hidden="true"
                style={{ color: "var(--accent)" }}
              />
              OPD: {hospital.opd.days}, {hospital.opd.hours}
            </li>
          </ul>

          {/* Social */}
          <div className="flex items-center gap-3 pt-1">
            <a
              href={hospital.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              title={hospital.social.instagramHandle}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}
            >
              <InstagramIcon size={18} aria-hidden="true" />
            </a>
            <a
              href={hospital.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Facebook"
              title={hospital.social.facebookHandle}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "#1877F2" }}
            >
              <FacebookIcon size={18} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3
            className="eyebrow mb-5 text-[var(--accent)]"
          >
            Quick Links
          </h3>
          <ul className="space-y-2.5" role="list">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm transition-all hover:text-white relative inline-block group py-1"
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-[var(--accent)] transition-all group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hospital Stats */}
        <div>
          <h3
            className="eyebrow mb-5"
            style={{ color: "var(--accent)", opacity: 1 }}
          >
            At a Glance
          </h3>
          <div className="space-y-4">
            {[
              { value: hospital.established.toString(), label: "Established" },
              { value: `${hospital.stats.departments}`, label: "Clinical Departments" },
              { value: `${hospital.stats.facilities}`, label: "Diagnostic Facilities" },
              { value: `${hospital.stats.yearsOfService}+`, label: "Years of Service" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="font-display text-2xl font-bold leading-none"
                  style={{ color: "var(--accent)" }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "rgba(255,255,255,0.60)" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </ScrollReveal>

      {/* ── Bottom Bar ── */}
      <div
        className="border-t py-5"
        style={{ borderColor: "rgba(255,255,255,0.10)" }}
      >
        <div className="container-site flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} South City Hospital. All rights reserved.
            </p>
            <span className="hidden sm:inline opacity-30">|</span>
            <div className="flex items-center gap-4 py-1">
              <Link
                href="/privacy-policy"
                className="hover:text-white transition-colors underline-offset-4 hover:underline py-1.5"
              >
                Privacy Policy
              </Link>
              <span className="opacity-30">·</span>
              <Link
                href="/terms-of-service"
                className="hover:text-white transition-colors underline-offset-4 hover:underline py-1.5"
              >
                Terms of Service
              </Link>
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-white/50">
            Made with <Heart size={12} aria-hidden="true" style={{ color: "var(--emergency)" }} /> for the people of Silchar.
          </p>
        </div>
      </div>
    </footer>
  );
}
