"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus, HelpCircle } from "lucide-react";
import { faqs } from "@/data/faqs";
import { ScrollReveal, StaggerReveal, StaggerItem, staggerItemVariants } from "@/components/ui/motion";
import { CtaBand } from "@/components/home/CtaBand";
import { FloatingBlobs, PulseLineWatermark } from "@/components/ui/svg-patterns";
import { renderTextWithTelLinks } from "@/lib/text-utils";

export function FaqClient() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      <section className="pt-8 pb-10 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20 relative overflow-hidden bg-hero-gradient" aria-label="FAQ hero">
        <FloatingBlobs />
        <PulseLineWatermark />
        <div className="container-site relative z-10">
          <ScrollReveal className="max-w-xl">
            <p className="eyebrow text-[var(--accent)] mb-3 sm:mb-4">Frequently Asked Questions</p>
            <h1 className="font-display text-display-xl text-white mb-3 sm:mb-4">
              Common questions,<br />
              <em className="not-italic" style={{ color: "var(--accent)" }}>clear answers.</em>
            </h1>
            <p className="text-white/75 text-base sm:text-lg">
              Find answers about our emergency services, departments, lab results, visiting hours, and how to reach us.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-[var(--section-y)]" style={{ background: "var(--white)" }} aria-label="FAQ list">
        <div className="container-site max-w-3xl">
          <StaggerReveal className="space-y-3 sm:space-y-4">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <StaggerItem key={faq.id} variants={staggerItemVariants}>
                  <div
                    className="card border rounded-[var(--radius-card)] overflow-hidden transition-all duration-300"
                    style={{ 
                      borderColor: isOpen ? "rgba(46, 107, 209, 0.3)" : "var(--mist)",
                      boxShadow: isOpen ? "var(--shadow-card)" : "none" 
                    }}
                  >
                    <button
                      id={`faq-btn-${faq.id}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${faq.id}`}
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenId(isOpen ? null : faq.id); } }}
                      className="w-full flex items-center gap-4 px-6 py-5 text-left transition-colors"
                      style={{ background: isOpen ? "var(--blue-50)" : "var(--white)" }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-2xs"
                        style={{
                          background: isOpen ? "var(--blue-600)" : "var(--sky-100)",
                          color: isOpen ? "white" : "var(--blue-700)"
                        }}
                        aria-hidden="true"
                      >
                        <HelpCircle size={16} />
                      </div>
                      <span className="flex-1 font-semibold text-[15px] pr-2 transition-colors" style={{ color: isOpen ? "var(--blue-950)" : "var(--ink-900)" }}>
                        {faq.question}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="shrink-0 rounded-full p-1 border"
                        style={{
                          background: isOpen ? "white" : "transparent",
                          borderColor: isOpen ? "var(--blue-100)" : "transparent",
                          color: isOpen ? "var(--blue-600)" : "var(--slate)",
                          boxShadow: isOpen ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
                        }}
                      >
                        <Plus size={18} aria-hidden="true" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-panel-${faq.id}`}
                          role="region"
                          aria-labelledby={`faq-btn-${faq.id}`}
                          key="panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                          className="overflow-hidden"
                          style={{ background: "var(--white)" }}
                        >
                          <div className="px-6 pb-6 pt-2 bg-white">
                            <p className="text-sm leading-relaxed" style={{ color: "var(--slate)" }}>
                              {renderTextWithTelLinks(faq.answer)}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerReveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
