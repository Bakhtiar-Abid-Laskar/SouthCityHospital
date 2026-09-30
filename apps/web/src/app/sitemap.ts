import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/hospital";
import { departments } from "@/data/departments";
import { getAllPublishedDoctors } from "@/lib/doctors";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // 1. Static public indexable pages
  const staticRoutes: Array<{
    url: string;
    priority: number;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    lastModified?: string | Date;
  }> = [
    { url: "", priority: 1.0, changeFrequency: "weekly" },
    { url: "/doctors", priority: 0.9, changeFrequency: "daily" },
    { url: "/departments", priority: 0.9, changeFrequency: "monthly" },
    { url: "/facilities", priority: 0.8, changeFrequency: "monthly" },
    { url: "/about", priority: 0.7, changeFrequency: "monthly" },
    { url: "/contact", priority: 0.7, changeFrequency: "monthly" },
    { url: "/faq", priority: 0.6, changeFrequency: "monthly" },
    { url: "/testimonials", priority: 0.6, changeFrequency: "monthly" },
    { url: "/gallery", priority: 0.5, changeFrequency: "monthly" },
    { url: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
    { url: "/terms-of-service", priority: 0.3, changeFrequency: "yearly" },
  ];

  const formattedStaticRoutes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    lastModified: route.lastModified || new Date(),
  }));

  // 2. Department pages
  const departmentRoutes: MetadataRoute.Sitemap = departments.map((dept) => ({
    url: `${baseUrl}/departments/${dept.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
    lastModified: new Date(),
  }));

  // 3. Dynamic published doctor profile pages
  let doctorRoutes: MetadataRoute.Sitemap = [];
  try {
    const publishedDoctors = await getAllPublishedDoctors();
    doctorRoutes = publishedDoctors.map((doc) => ({
      url: `${baseUrl}/doctors/${doc.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
    }));
  } catch (err) {
    console.warn("Could not generate doctor sitemap entries:", err);
  }

  return [...formattedStaticRoutes, ...departmentRoutes, ...doctorRoutes];
}
