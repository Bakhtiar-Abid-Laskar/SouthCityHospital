# Baseline Audit Report — South City Hospital Web App

**Date & Time**: 2026-09-28T10:52:00+05:30  
**Target App**: `@sch/web` (South City Hospital Public Website)  
**Host URL Tested**: `http://localhost:3000` (Production Next.js Server)  
**Environment**: Next.js 16.3.2 (App Router, Turbopack), React 19.2.8, TailwindCSS v4, TypeScript 5.8.3, Node.js v24.19.0 on Windows

---

## 1. Global Gates Baseline

| Gate | Status | Details |
|---|---|---|
| **Production Build** | **PASS** | `next build` succeeded in 8.0s. All 19 routes generated cleanly (16 static prerendered, 3 dynamic server-rendered). |
| **Type Check** | **PASS** | `tsc --noEmit` exited 0 with 0 diagnostic type errors. |
| **Linter (`eslint`)** | **FAIL** | 51 problems (24 errors, 27 warnings). Primary issues: React 19 hook purity rules (`react-hooks/set-state-in-effect` in `Navbar.tsx`), variable hoisting in `StayUpdatedModal.tsx`, and explicit `any` types in Supabase / analytics / service layers. |
| **Automated Tests** | **NONE** | No test runner configured in `package.json`. Playwright browser screenshot script present (`capture-screenshots.js`). |

---

## 2. Lighthouse Baseline Scores

Audited with Lighthouse 13.5.0 (Headless Chromium, Simulated Throttling):

| Page & Mode | Performance | Accessibility | Best Practices | SEO | FCP | LCP | CLS | TBT |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Homepage (`/`) — Desktop** | **89** | **97** | **100** | **100** | 0.3 s | 1.7 s | 0 | 70 ms |
| **Homepage (`/`) — Mobile** | **69** | **97** | **100** | **100** | 1.1 s | 6.5 s | 0 | 230 ms |
| **About (`/about`) — Desktop** | **95** | **97** | **100** | **100** | 0.3 s | 1.5 s | 0 | 30 ms |
| **About (`/about`) — Mobile** | **74** | **97** | **100** | **100** | 0.9 s | 5.8 s | 0 | 200 ms |
| **Doctors (`/doctors`) — Desktop** | **89** | **97** | **100** | **100** | 0.3 s | 1.6 s | 0 | 80 ms |
| **Doctors (`/doctors`) — Mobile** | **47** | **97** | **100** | **100** | 1.7 s | 7.0 s | 0 | 1,090 ms |

### Key Observations from Baseline:
1. **Accessibility (97) & SEO (100)**: Solid initial foundation; missing skip-link in DOM and JSON-LD structured data are the chief remaining items.
2. **Mobile Performance Bottleneck**: Mobile LCP (5.8s – 7.0s) and TBT (up to 1,090ms on `/doctors`) are throttled heavily due to unoptimized hero image assets and client-side hydration overhead of heavy modals / animations.
3. **Desktop Performance**: Strong (89 – 95 across tested pages).

---

## 3. Site Inventory & Route Map

| Route | Type | Purpose | Content Source |
|---|---|---|---|
| `/` | Static | Hospital Landing Page | `src/app/page.tsx`, `components/home/*`, `data/hospital.ts` |
| `/about` | Static | Mission, history, leadership, values | `src/app/about/page.tsx`, `data/hospital.ts` |
| `/departments` | Static | 13 Clinical Departments overview | `src/data/departments.ts` |
| `/facilities` | Static | 13 Diagnostic & Critical Care Facilities | `src/data/facilities.ts` |
| `/doctors` | Static shell + Client | Doctor directory with filtering & booking | Supabase `doctors` table / `/api/doctors` |
| `/contact` | Static | Location, emergency contacts, enquiry form | `src/data/hospital.ts` |
| `/faq` | Static | Frequently Asked Questions & Prep Guides | `src/data/faqs.ts`, `data/prep-instructions.ts` |
| `/testimonials` | Static | Patient reviews & community feedback | `src/data/testimonials.ts` |
| `/gallery` | Static | Hospital facility & ward photo showcase | `src/app/gallery/page.tsx` |
| `/booking-status` | Dynamic | Patient appointment status verification | Client query / Supabase |
| `/privacy-policy` | Static | Legal Privacy Policy draft | `src/data/privacy.ts` |
| `/terms-of-service` | Static | Legal Terms of Service draft | `src/data/terms.ts` |
| `/_not-found` | Static | Custom 404 Error Dead-end Handler | `src/app/not-found.tsx` |
| `/sitemap.xml` | Dynamic Metadata | XML Sitemap | `src/app/sitemap.ts` |
| `/robots.txt` | Dynamic Metadata | Crawler Instructions | `src/app/robots.ts` |
| `/manifest.webmanifest` | Dynamic Metadata | PWA / Mobile Web Manifest | `src/app/manifest.ts` |
| `/api/doctors` | Route Handler | JSON API for doctor directory | Supabase backend |
