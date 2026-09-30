import type { Metadata } from "next";
import { DepartmentsClient } from "./DepartmentsClient";

export const metadata: Metadata = {
  title: "Clinical Departments & Specialties",
  description:
    "Explore 13 clinical departments at South City Hospital in Silchar, from Cardiology and Orthopaedics to Neuro Surgery and Paediatrics. Expert care every day.",
  alternates: {
    canonical: "https://southcityhospital.in/departments",
  },
};

export default function DepartmentsPage() {
  return <DepartmentsClient />;
}
