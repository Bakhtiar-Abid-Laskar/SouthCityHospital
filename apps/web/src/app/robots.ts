import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/hospital";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/staff/", "/booking-status"],
      },
      {
        userAgent: [
          "GPTBot",
          "PerplexityBot",
          "ClaudeBot",
          "Google-Extended",
          "CCBot",
          "Applebot-Extended",
          "Bytespider",
        ],
        allow: [
          "/",
          "/doctors",
          "/doctors/",
          "/departments",
          "/departments/",
          "/facilities",
          "/faq",
          "/about",
          "/contact",
          "/llms.txt",
          "/llms-full.txt",
        ],
        disallow: ["/api/", "/admin/", "/staff/", "/booking-status"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
