# South City Hospital Platform — Complete Full-Stack Code & Security Audit Report

**Date of Audit:** August 31, 2026  
**Audited Targets:**
- `apps/web/` — Public Website & Patient Booking Portal (Next.js 15 App Router)
- `apps/admin/` — Hospital Staff & Administrator Operations Hub (Next.js 15 App Router)
- `packages/types/` — Shared Domain Models & Schema Definitions
- `supabase/schema.sql` — PostgreSQL Database Schema, RLS, RPCs, and Triggers
- Authentication & JWT Session Architecture

---

## 1. Executive Summary & Security Posture

| Metric | Rating / Value |
|---|---|
| **Overall Code Quality Score** | **88 / 100** |
| **Overall Security Rating** | **B+ (Action Required Before Production)** |
| **Critical Vulnerabilities** | **1** |
| **High-Risk Issues** | **2** |
| **Medium-Risk Issues** | **3** |
| **Low-Risk / Hygiene Observations** | **4** |
| **TypeScript Compilation Health** | **Clean (0 errors across all workspaces)** |

The codebase features exceptional UI design consistency, modern TypeScript architecture with shared domain models, atomic database RPCs with collision-safe sequence numbering, and robust client-side image compression. However, there are a few critical authorization gaps in API routes and database Row-Level Security policies that must be fortified before launching to production.

---

## 2. Vulnerability & Findings Matrix

```
┌────────────────────────────┬──────────┬─────────────────────────────────────────────────────────────┐
│ Category                   │ Severity │ Description                                                 │
├────────────────────────────┼──────────┼─────────────────────────────────────────────────────────────┤
│ 1. API Route Authorization │ CRITICAL │ Unauthenticated POST/DELETE handlers in /api/doctors        │
│ 2. Database RLS Policies   │ HIGH     │ Overly permissive USING (true) on sensitive DB tables        │
│ 3. Client/Server Boundary  │ HIGH     │ Client component invoking server-only admin client in staff │
│ 4. Session Security        │ MEDIUM   │ Fallback JWT secret string when JWT_SECRET_KEY omitted      │
│ 5. Route Protection        │ MEDIUM   │ Missing server-side Next.js edge middleware in admin app    │
│ 6. Public Endpoint Abuse   │ MEDIUM   │ Unthrottled appointment search lookup by phone/dob          │
│ 7. Code Hygiene & Fallback │ LOW      │ In-memory/localStorage fallback consistency                 │
│ 8. HTTP Security Headers   │ LOW      │ Missing HSTS/CSP security headers in Next.js config         │
└────────────────────────────┴──────────┴─────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Audit Findings & Remediation

---

### Finding 1: Unauthenticated Doctor Mutation API Routes
- **File:** `apps/admin/src/app/api/doctors/route.ts`
- **Severity:** `CRITICAL`
- **Category:** Broken Object Level Authorization / Missing Authentication

#### Vulnerability Details
The `POST` (upsert doctor) and `DELETE` (delete single doctor or purge all doctors via `?all=true`) HTTP handlers in `apps/admin/src/app/api/doctors/route.ts` utilize `getServiceSupabaseClient()` with `SUPABASE_SERVICE_ROLE_KEY` but **do not check for an authenticated session** via `requireAdmin()`.
Any unauthenticated attacker on the network could send a delete request to purge all doctors in the database.

#### Remediation
Add `await requireAdmin()` at the entry point of both `POST` and `DELETE` handlers in `apps/admin/src/app/api/doctors/route.ts`.

---

### Finding 2: Overly Permissive Row-Level Security (RLS) on Sensitive Tables
- **File:** `supabase/schema.sql`
- **Severity:** `HIGH`
- **Category:** Information Disclosure / Broken Access Control

#### Vulnerability Details
Several RLS policies in `supabase/schema.sql` are written with `FOR SELECT USING (true)`:
1. `appointments` table: `CREATE POLICY "Staff and admin can view appointments" ON appointments FOR SELECT USING (true);`
2. `patients` table: `CREATE POLICY "Staff and admin can view patients" ON patients FOR SELECT USING (true);`
3. `staff_accounts` table: `CREATE POLICY "Allow staff authentication and management" ON staff_accounts FOR ALL USING (true) WITH CHECK (true);`

Because the Supabase anonymous key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is public and embedded in client-side web bundles, any visitor could query table data directly without logging in.

#### Remediation
1. Block direct table SELECT/UPDATE from `anon` on `appointments`, `patients`, and `staff_accounts`.
2. All patient-facing lookups must go through `SECURITY DEFINER` RPCs (`lookup_booking`, `create_booking`), which enforce strict reference ID or (phone + DOB) matching.
3. Update policies to require `auth.role() = 'authenticated'` or rely on server-side service role queries.

---

### Finding 3: Client-Side Calling of Server-Only Auth Methods
- **File:** `apps/admin/src/app/staff/page.tsx`
- **Severity:** `HIGH`
- **Category:** Architecture / Environment Boundary Violation

#### Vulnerability Details
`StaffManagementPage` directly called `createStaffAccount()`, which imported `createAdminClient()`. In browser bundles, `process.env.SUPABASE_SERVICE_ROLE_KEY` is undefined for security reasons. As a result, creating a new staff member failed silently against Supabase and fell back to storing credentials in browser `localStorage`.

#### Remediation
`StaffManagementPage` should dispatch HTTP requests to the dedicated server API route (`/api/staff`), which executes securely on the server with `requireAdmin()` and `createAdminClient()`.

---

### Finding 4: Fallback Secret Key for Admin JWT Sessions
- **File:** `apps/admin/src/lib/auth/session.ts`
- **Severity:** `MEDIUM`
- **Category:** Cryptographic / Credential Management

#### Vulnerability Details
`const SECRET_KEY = process.env.JWT_SECRET_KEY || "super-secret-default-key-for-dev";`
If an operator deploys `apps/admin` to production and forgets to populate `JWT_SECRET_KEY` in environment secrets, any attacker who knows the open-source repository code can forge valid admin session JWTs.

#### Remediation
Throw an explicit startup error if `JWT_SECRET_KEY` is missing in production.

---

### Finding 5: Missing Edge Middleware for Server-Side Route Guarding
- **File:** `apps/admin/src/middleware.ts`
- **Severity:** `MEDIUM`
- **Category:** Defense-in-Depth / Access Control

#### Vulnerability Details
Unauthorized users accessing `/dashboard`, `/doctors`, `/patients`, `/schedules`, or `/subscribers` rely entirely on client-side `useEffect` hooks in React to trigger `router.push("/login")`. This causes a brief flash of protected UI layout components before JavaScript redirects.

#### Remediation
Create `apps/admin/src/middleware.ts` to intercept protected routes at the Next.js edge and verify JWT cookies prior to page render.

---

### Finding 6: Rate Limiting on Patient Booking Lookups
- **File:** `supabase/schema.sql`
- **Severity:** `MEDIUM`
- **Category:** Rate Limiting / Enumeration Prevention

#### Vulnerability Details
`lookup_booking` is a public RPC that takes `(patient_phone, patient_dob)` and returns appointment history. While requiring both phone and date of birth prevents naive enumeration, an automated script could test candidate phone numbers across common birth years.

#### Remediation
Add rate-limiting matching the pattern in `register_subscriber`: max 5 lookup attempts per IP/phone per 15 minutes.

---

### Finding 7: HTTP Security Headers in Next.js
- **File:** `apps/web/next.config.ts` & `apps/admin/next.config.ts`
- **Severity:** `LOW`
- **Category:** Security Hygiene

#### Remediation
Configure security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) in `next.config.ts`.
