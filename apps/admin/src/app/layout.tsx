import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "South City Hospital — Operations Portal",
  description: "Internal administrative and staff operations portal for South City Hospital.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png?v=20261001c", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=20261001c", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico?v=20261001c", sizes: "any" },
      { url: "/icon-192.png?v=20261001c", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=20261001c", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=20261001c", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=20261001c",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="font-sans antialiased bg-[var(--cloud)] text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}
