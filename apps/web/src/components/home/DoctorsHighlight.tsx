"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, UserRound } from "lucide-react";
import { ScrollReveal, StaggerReveal, StaggerItem } from "@/components/ui/motion";
import { useDoctors } from "@/services/doctors";

/**
 * DoctorsHighlight — Home page section.
 * Dynamically fetches up to 3 active doctors via the useDoctors hook.
 * Never hardcodes any doctor data.
 */
export function DoctorsHighlight() {
  const { data: doctors, isLoading, isError } = useDoctors({ activeOnly: true });
  const highlighted = doctors?.slice(0, 3);

  return (
    <section
      aria-labelledby="doctors-heading"
      className="py-[var(--section-y)]"
      style={{ background: "var(--white)" }}
    >
      <div className="container-site">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <ScrollReveal>
            <p className="eyebrow mb-3">Our Specialists</p>
            <h2
              id="doctors-heading"
              className="font-display text-display-lg"
              style={{ color: "var(--primary-dark)" }}
            >
              Meet our
              <br />
              medical team.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Link
              href="/doctors"
              className="btn btn-outline gap-2 whitespace-nowrap self-start"
            >
              All Doctors
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </ScrollReveal>
        </div>

        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card border border-[var(--mist)] p-6 space-y-4 animate-pulse"
              >
                <div className="w-20 h-20 rounded-full bg-[var(--mist)] mx-auto" />
                <div className="h-4 bg-[var(--mist)] rounded w-3/4 mx-auto" />
                <div className="h-3 bg-[var(--mist)] rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-center py-8" style={{ color: "var(--slate)" }}>
            Unable to load doctor profiles at this time.{" "}
            <a href="/contact" style={{ color: "var(--primary)" }} className="underline">
              Contact us directly.
            </a>
          </p>
        )}

        {!isLoading && !isError && highlighted && highlighted.length === 0 && (
          <div className="text-center py-10">
            <UserRound size={40} className="mx-auto mb-3" style={{ color: "var(--mist)" }} />
            <p className="text-sm" style={{ color: "var(--slate)" }}>
              Doctor profiles are being updated. Check back soon.
            </p>
          </div>
        )}

        {!isLoading && !isError && highlighted && highlighted.length > 0 && (
          <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {highlighted.map((doctor) => (
              <StaggerItem key={doctor.id}>
                <Link
                  href="/doctors"
                  className="card border border-[var(--mist)] p-6 flex flex-col items-center text-center gap-3 group h-full"
                >
                {/* Headshot */}
                <div
                  className="relative w-20 h-20 rounded-full overflow-hidden border-2 shrink-0"
                  style={{ borderColor: "var(--mist)" }}
                >
                  {doctor.photoUrl ? (
                    <Image
                      src={doctor.photoUrl}
                      alt={doctor.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: "var(--primary-light)" }}
                    >
                      <UserRound size={28} style={{ color: "var(--primary)" }} aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div>
                  <h3
                    className="font-display font-semibold text-base group-hover:text-[var(--primary)] transition-colors"
                    style={{ color: "var(--ink)" }}
                  >
                    {doctor.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--slate)" }}>
                    {doctor.qualifications.join(", ")}
                  </p>
                </div>
                <span className="chip chip-diagnostic">{doctor.departmentSlug}</span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerReveal>
        )}
      </div>
    </section>
  );
}
