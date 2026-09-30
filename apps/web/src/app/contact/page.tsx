import type { Metadata } from "next";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact & 24/7 Emergency Helpline",
  description:
    "Reach South City Hospital in Meherpur, Silchar. Call our 24/7 emergency hotline at +91 6901271223 or visit our round-the-clock OPD for immediate medical care.",
  alternates: {
    canonical: "https://southcityhospital.in/contact",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
