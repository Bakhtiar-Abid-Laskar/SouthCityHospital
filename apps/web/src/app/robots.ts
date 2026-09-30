import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/hospital";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/staff/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
