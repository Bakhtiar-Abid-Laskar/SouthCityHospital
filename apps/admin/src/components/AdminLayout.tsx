"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarCheck,
  Stethoscope,
  Clock,
  Users,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  MessageSquare,
  BellRing,
} from "lucide-react";
import type { UserRole } from "@sch/types";

interface AdminLayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
  userEmail?: string;
  userName?: string;
}

export function AdminLayout({
  children,
  userRole = "staff",
  userEmail = "",
  userName = "Staff",
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    role: userRole,
    email: userEmail,
    name: userName,
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser({
            role: data.user.role,
            email: data.user.email,
            name: data.user.fullName,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const navLinks = [
    ...(currentUser.role === "admin"
      ? [
          {
            href: "/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
        ]
      : []),
    {
      href: "/bookings",
      label: "Bookings Hub",
      icon: CalendarCheck,
    },
    ...(currentUser.role === "admin"
      ? [
          {
            href: "/doctors",
            label: "Doctors",
            icon: Stethoscope,
          },
          {
            href: "/schedules",
            label: "Schedules & Availability",
            icon: Clock,
          },
          {
            href: "/patients",
            label: "Patients CRM",
            icon: Users,
          },
          {
            href: "/staff",
            label: "Staff Accounts",
            icon: ShieldCheck,
          },
        ]
      : []),
    {
      href: "/queries",
      label: "Contact Queries",
      icon: MessageSquare,
    },
    {
      href: "/subscribers",
      label: "Subscribers",
      icon: BellRing,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--cloud)] flex flex-col">
      {/* ── Top Admin Header ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--mist)] shadow-xs px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between min-h-[76px]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="p-2 rounded-xl text-[var(--slate)] hover:bg-[var(--cloud)] hover:text-[var(--navy-950)] lg:hidden transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href={currentUser.role === "admin" ? "/dashboard" : "/bookings"} className="flex items-center gap-3.5 group">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-[var(--mist)] shadow-xs bg-white group-hover:scale-105 transition-transform">
              <Image src="/logo.jpg" alt="South City Hospital" fill sizes="44px" className="object-cover" />
            </div>
            <div>
              <span className="font-display font-bold text-base sm:text-lg text-[var(--navy-950)] leading-tight block">
                South City Hospital
              </span>
              <span className="text-xs text-[var(--slate)] font-medium block mt-0.5">
                Operations &amp; Admin Portal
              </span>
            </div>
          </Link>
        </div>

        {/* User Badge & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-[var(--navy-950)] leading-tight">
              {currentUser.name}
            </span>
            <span className="text-xs text-[var(--slate)] font-medium mt-0.5">{currentUser.email}</span>
          </div>

          <span
            className={`chip text-xs font-bold py-1 px-3 uppercase tracking-wider rounded-lg shadow-2xs ${
              currentUser.role === "admin"
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {currentUser.role}
          </span>

          <button
            onClick={handleLogout}
            className="btn btn-outline text-xs sm:text-sm py-2 px-3.5 border-[var(--mist)] text-[var(--slate)] hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all rounded-xl gap-1.5 flex items-center font-semibold"
            title="Log Out"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* ── Main Layout Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-[var(--mist)] flex-col justify-between p-4 shrink-0">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--slate)] mb-2">
              {currentUser.role === "admin" ? "Administration" : "Staff Operations"}
            </p>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[var(--primary)] text-white shadow-xs"
                      : "text-[var(--slate)] hover:text-[var(--navy-950)] hover:bg-[var(--cloud)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{link.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} />}
                </Link>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-[var(--cloud)] border border-[var(--mist)] text-[11px] text-[var(--slate)]">
            <p className="font-semibold text-[var(--navy-950)]">South City Portal</p>
            <p className="mt-0.5">Role: <strong className="capitalize">{currentUser.role}</strong></p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative w-64 bg-white z-50 p-4 flex flex-col justify-between shadow-2xl">
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--slate)] mb-2">
                  Navigation
                </p>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[var(--primary)] text-white shadow-xs"
                          : "text-[var(--slate)] hover:text-[var(--navy-950)] hover:bg-[var(--cloud)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} />
                        <span>{link.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-outline text-xs w-full justify-center text-red-600 border-red-200 hover:bg-red-50 gap-2"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
