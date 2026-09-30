import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/hospital";
import { departments } from "@/data/departments";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

  // List of all public, canonical, indexable static routes in South City Hospital web app
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
    { url: "/booking-status", priority: 0.5, changeFrequency: "monthly" },
    { url: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
    { url: "/terms-of-service", priority: 0.3, changeFrequency: "yearly" },
  ];

  const formattedStaticRoutes = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    ...(route.lastModified ? { lastModified: route.lastModified } : {}),
  }));

  const departmentRoutes = departments.map((dept) => ({
    url: `${baseUrl}/departments/${dept.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...formattedStaticRoutes, ...departmentRoutes];
}
