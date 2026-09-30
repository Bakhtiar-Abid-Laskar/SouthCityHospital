import type { Metadata } from "next";
import { FaqClient } from "./FaqClient";

export const metadata: Metadata = {
  title: "Patient FAQs & Hospital Guide",
  description:
    "Find clear answers on doctor consultations, emergency care, diagnostic prep, visiting hours, and admission procedures at South City Hospital in Silchar.",
  alternates: {
    canonical: "https://southcityhospital.in/faq",
  },
};

export default function FaqPage() {
  return <FaqClient />;
}
