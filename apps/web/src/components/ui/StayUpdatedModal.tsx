"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, User, Phone, CheckCircle2, BellRing } from "lucide-react";
import { registerSubscriber } from "@/services/subscribers";
import { cn } from "@/lib/utils";

// â”€â”€ Storage keys â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const KEY_REGISTERED = "sch_subscriber_registered_v1";
const KEY_DISMISSED  = "sch_subscriber_dismissed_v1"; // sessionStorage

// â”€â”€ Zod schema â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const schema = z.object({
  name: z
    .string()
    .min(2, "Please enter your full name (at least 2 characters).")
    .max(80, "Name must be 80 characters or fewer.")
    .regex(/^[\p{L}\s.\-']+$/u, "Please enter a valid name."),
  phone: z
    .string()
    .min(10, "Please enter a valid 10-digit mobile number.")
    .refine(
      (val) => val.replace(/\D/g, "").length >= 10,
      "Please enter a valid 10-digit mobile number."
    ),
});
type FormData = z.infer<typeof schema>;

// â”€â”€ Focus trap hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, [active]);

  return containerRef;
}

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function StayUpdatedModal() {
  const [show, setShow]           = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const prefersReduced = useReducedMotion();
  const triggerRef = useRef<HTMLElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Suppression check
  useEffect(() => {
    try {
      if (localStorage.getItem(KEY_REGISTERED)) return;
      if (sessionStorage.getItem(KEY_DISMISSED)) return;
    } catch {
      return; // storage unavailable â€” don't show
    }

    const timer = setTimeout(() => {
      triggerRef.current = document.activeElement as HTMLElement;
      setShow(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = useCallback(() => {
    try { sessionStorage.setItem(KEY_DISMISSED, "1"); } catch {}
    setShow(false);
    setTimeout(() => triggerRef.current?.focus(), 50);
  }, []);

  // Escape to dismiss
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, handleDismiss]);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const cleanPhone = data.phone.replace(/\D/g, "").slice(-10);
    const result = await registerSubscriber({ name: data.name, phone: cleanPhone });
    if (result.success) {
      try { localStorage.setItem(KEY_REGISTERED, "1"); } catch {}
      setSubmitted(true);
      setTimeout(() => setShow(false), 2800);
    } else {
      setServerError(result.error || "Something went wrong. Please try again.");
    }
  };

  const containerRef = useFocusTrap(show);

  // Motion variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };
  const panelVariants = prefersReduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden:  { opacity: 0, y: 24, scale: 0.96 },
        visible: { opacity: 1, y: 0,  scale: 1,
          transition: { type: "spring" as const, stiffness: 360, damping: 30 } },
        exit:    { opacity: 0, y: 16, scale: 0.97,
          transition: { duration: 0.18 } },
      };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(10,18,36,0.60)", backdropFilter: "blur(4px)" }}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stay-updated-title"
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
          >
            <div
              ref={containerRef}
              className="w-full max-w-sm rounded-[var(--radius-card)] shadow-[var(--shadow-overlay)] overflow-hidden"
              style={{ background: "var(--cloud)" }}
            >
              {/* Header accent bar */}
              <div
                className="h-1.5 w-full"
                style={{ background: "linear-gradient(90deg, var(--blue-600) 0%, var(--accent) 100%)" }}
              />

              <div className="p-6">
                {/* Dismiss button */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <BellRing size={18} style={{ color: "var(--primary)" }} aria-hidden="true" />
                  </div>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="p-1.5 rounded-lg transition-colors hover:bg-[var(--mist)]"
                    style={{ color: "var(--slate)" }}
                    aria-label="Close registration popup"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center text-center gap-3 py-4"
                    >
                      <CheckCircle2 size={44} style={{ color: "var(--primary)" }} aria-hidden="true" />
                      <div>
                        <p
                          className="font-display font-semibold text-lg mb-1"
                          style={{ color: "var(--blue-950)" }}
                        >
                          You are registered
                        </p>
                        <p className="text-sm" style={{ color: "var(--slate)" }}>
                          We will keep you informed about health updates, new services, and important announcements from South City Hospital.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h2
                        id="stay-updated-title"
                        className="font-display font-semibold text-xl mb-1"
                        style={{ color: "var(--blue-950)" }}
                      >
                        Stay updated
                      </h2>
                      <p className="text-sm mb-5" style={{ color: "var(--slate)" }}>
                        Register to receive health updates and important announcements from South City Hospital.
                      </p>

                      {serverError && (
                        <div
                          className="mb-4 p-3 rounded-lg text-sm border"
                          style={{
                            background: "rgba(var(--emergency-rgb, 220,38,38),0.08)",
                            borderColor: "rgba(var(--emergency-rgb, 220,38,38),0.2)",
                            color: "var(--emergency)",
                          }}
                        >
                          {serverError}
                        </div>
                      )}

                      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
                        {/* Name */}
                        <div>
                          <label
                            htmlFor="sub-name"
                            className="block text-xs font-medium mb-1.5"
                            style={{ color: "var(--ink)" }}
                          >
                            Full name <span style={{ color: "var(--emergency)" }}>*</span>
                          </label>
                          <div className="relative">
                            <User
                              size={14}
                              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                              style={{ color: "var(--slate)" }}
                              aria-hidden="true"
                            />
                            <input
                              id="sub-name"
                              type="text"
                              autoComplete="name"
                              placeholder="Your name"
                              className={cn(
                                "input-base w-full pl-9 pr-4 py-2.5 border rounded-[var(--radius-button)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue-400)] focus:border-transparent transition-all",
                                errors.name
                                  ? "border-[var(--emergency)]"
                                  : "border-[var(--mist)] bg-white"
                              )}
                              {...register("name")}
                            />
                          </div>
                          {errors.name && (
                            <p className="mt-1 text-xs" style={{ color: "var(--emergency)" }}>
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label
                            htmlFor="sub-phone"
                            className="block text-xs font-medium mb-1.5"
                            style={{ color: "var(--ink)" }}
                          >
                            Phone number <span style={{ color: "var(--emergency)" }}>*</span>
                          </label>
                          <div className="relative">
                            <Phone
                              size={14}
                              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                              style={{ color: "var(--slate)" }}
                              aria-hidden="true"
                            />
                            <input
                              id="sub-phone"
                              type="tel"
                              autoComplete="tel"
                              placeholder="98765 43210"
                              maxLength={15}
                              className={cn(
                                "input-base w-full pl-9 pr-4 py-2.5 border rounded-[var(--radius-button)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue-400)] focus:border-transparent transition-all",
                                errors.phone
                                  ? "border-[var(--emergency)]"
                                  : "border-[var(--mist)] bg-white"
                              )}
                              {...register("phone")}
                            />
                          </div>
                          {errors.phone && (
                            <p className="mt-1 text-xs" style={{ color: "var(--emergency)" }}>
                              {errors.phone.message}
                            </p>
                          )}
                        </div>

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn btn-primary w-full gap-2 disabled:opacity-60 min-h-[44px] mt-1"
                        >
                          {isSubmitting ? (
                            <>
                              <span
                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                aria-hidden="true"
                              />
                              Registering...
                            </>
                          ) : (
                            "Register now"
                          )}
                        </button>

                        {/* Dismiss link */}
                        <button
                          type="button"
                          onClick={handleDismiss}
                          className="w-full text-center text-xs py-1 transition-colors hover:underline"
                          style={{ color: "var(--slate)" }}
                        >
                          Maybe later
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
