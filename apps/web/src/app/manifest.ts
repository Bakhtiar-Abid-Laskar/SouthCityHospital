import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "South City Hospital Silchar",
    short_name: "South City",
    description:
      "Multi-specialty hospital with 13 clinical departments and 24/7 emergency services in Meherpur, Silchar, Assam.",
    start_url: "/",
    display: "standalone",
    background_color: "#071b3d",
    theme_color: "#0a2540",
    icons: [
      {
        src: "/icon-192.png?v=20261001c",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png?v=20261001c",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png?v=20261001c",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
