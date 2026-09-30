import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.southcityhospital.in",
          },
        ],
        destination: "https://southcityhospital.in/:path*",
        permanent: true,
      },
    ];
  },
  // Allow cross-origin dev resources in the IDE preview environment and mobile LAN
  allowedDevOrigins: [
    "10.135.48.122",
    "10.135.48.122:3000",
    "10.173.241.10",
    "10.173.241.10:3000",
    "10.238.228.10",
    "10.238.228.10:3000",
    "localhost:3000",
  ],
  transpilePackages: ["@sch/types"],
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        // Google reviewer profile photos returned by Places API (New)
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

export default nextConfig;
