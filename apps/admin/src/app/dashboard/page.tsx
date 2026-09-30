"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  CalendarCheck,
  Stethoscope,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Ban,
  Calendar,
  Phone,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import {
  fetchOperationalDashboard,
  updateBookingStatus,
  type DashboardMetrics,
} from "@/services/admin-bookings";
import { useDoctors } from "@/services/doctors";
import { fetchDoctorExceptions } from "@/services/doctor-schedules";
import { formatDisplayDate } from "@/lib/date-utils";
import type { Appointment, AppointmentStatus, DoctorAvailabilityException, UserRole } from "@sch/types";

export default function AdminDashboardPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalToday: 0,
    remainingToday: 0,
    unavailableDoctorsToday: 0,
    patientsTriagedToday: 0,
    todayAppointments: [],
    recentRegistrations: [],
    forecast7Days: [],
  });
  const [exceptions, setExceptions] = useState<DoctorAvailabilityException[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: doctors } = useDoctors({ activeOnly: false });
  const todayStr = new Date().toISOString().split("T")[0];

  const loadLiveDashboard = async () => {
    try {
      const [dashData, excData] = await Promise.all([
        fetchOperationalDashboard(todayStr),
        fetchDoctorExceptions(),
      ]);
      setMetrics(dashData);
      setExceptions(excData);
    } catch (err) {
      console.error("Dashboard live fetch error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentRole(data.user.role);
          if (data.user.role !== "admin") {
            window.location.href = "/bookings";
          }
        }
      })
      .catch(() => {});

    loadLiveDashboard();
  }, [todayStr]);

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    setUpdatingId(appointmentId);
    try {
      await updateBookingStatus(appointmentId, newStatus);
      setMetrics((prev) => ({
        ...prev,
        todayAppointments: prev.todayAppointments.map((a) =>
          a.id === appointmentId ? { ...a, status: newStatus } : a
        ),
        remainingToday: prev.todayAppointments
          .map((a) => (a.id === appointmentId ? { ...a, status: newStatus } : a))
          .filter((a) => a.status !== "Completed" && a.status !== "Cancelled").length,
      }));
    } catch (err) {
      console.error("Status update error", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (currentRole !== "admin") {
    return (
      <AdminLayout userRole="staff">
        <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
          <AlertCircle size={36} className="text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-red-800">403 — Access Forbidden</h2>
          <p className="text-xs text-[var(--slate)] mt-1">
            Staff accounts are restricted to the Bookings Hub only.
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout userRole="admin">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-[var(--slate)]">Loading operational data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-[var(--navy-950)]">
              Hospital Operational Dashboard
            </h1>
            <p className="text-xs text-[var(--slate)] mt-0.5">
              Live consultation metrics, triage roster, physician availability, and weekly forecasts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsRefreshing(true);
                loadLiveDashboard();
              }}
              disabled={isRefreshing}
              className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 border-[var(--mist)] bg-white hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-[var(--primary)]" : ""} />
              <span>{isRefreshing ? "Syncing..." : "Sync Live DB"}</span>
            </button>
            <span className="chip chip-diagnostic text-xs py-1 px-3">
              {formatDisplayDate(todayStr)}
            </span>
          </div>
        </div>

        {/* Snapshot Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[var(--slate)]">
              <span className="text-xs font-semibold">Total Bookings Today</span>
              <CalendarCheck size={18} className="text-[var(--primary)]" />
            </div>
            <p className="font-display font-bold text-2xl text-[var(--navy-950)]">
              {isLoading ? "..." : metrics.totalToday}
            </p>
            <p className="text-[11px] text-[var(--slate)]">All scheduled patient slots</p>
          </div>

          <div className="card p-5 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[var(--slate)]">
              <span className="text-xs font-semibold">Appointments Remaining</span>
              <Clock size={18} className="text-amber-600" />
            </div>
            <p className="font-display font-bold text-2xl text-amber-700">
              {isLoading ? "..." : metrics.remainingToday}
            </p>
            <p className="text-[11px] text-[var(--slate)]">Pending consultation</p>
          </div>

          <div className="card p-5 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[var(--slate)]">
              <span className="text-xs font-semibold">Doctors Unavailable Today</span>
              <Ban size={18} className="text-red-500" />
            </div>
            <p className="font-display font-bold text-2xl text-red-600">
              {isLoading ? "..." : metrics.unavailableDoctorsToday}
            </p>
            <p className="text-[11px] text-[var(--slate)]">On leave or blocked</p>
          </div>

          <div className="card p-5 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[var(--slate)]">
              <span className="text-xs font-semibold">Patients Triaged Today</span>
              <Users size={18} className="text-purple-600" />
            </div>
            <p className="font-display font-bold text-2xl text-purple-700">
              {isLoading ? "..." : metrics.patientsTriagedToday}
            </p>
            <p className="text-[11px] text-[var(--slate)]">Unique patient records</p>
          </div>
        </div>

        {/* Live Roster & Doctor Availability */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card bg-white border border-[var(--mist)] rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-[var(--mist)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={16} className="text-[var(--primary)]" />
                  <h2 className="font-display font-semibold text-sm text-[var(--navy-950)]">
                    Today&apos;s Live Consultations ({metrics.todayAppointments.length})
                  </h2>
                </div>
                <Link
                  href="/bookings"
                  className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  <span>Open Full Hub</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--cloud)]/60 text-[var(--slate)] font-bold border-b border-[var(--mist)] uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Physician</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--mist)]">
                    {metrics.todayAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-[var(--slate)]">
                          {isLoading ? "Loading appointments..." : "No appointments booked for today yet."}
                        </td>
                      </tr>
                    ) : (
                      metrics.todayAppointments.slice(0, 8).map((apt) => (
                        <tr key={apt.id} className="hover:bg-[var(--cloud)]/40 transition-colors">
                          <td className="py-3 px-4 font-semibold text-[var(--navy-950)] whitespace-nowrap">
                            {apt.preferredTimeSlot || "OPD Hours"}
                          </td>
                          <td className="py-3 px-4 font-medium text-[var(--navy-950)]">
                            {apt.patientName}
                          </td>
                          <td className="py-3 px-4 text-[var(--slate)]">
                            {apt.doctorName}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`chip text-[10px] font-bold py-0.5 px-2 ${
                                apt.status === "Confirmed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : apt.status === "Completed"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : apt.status === "Cancelled"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {apt.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {apt.status === "Pending" && (
                                <button
                                  type="button"
                                  disabled={updatingId === apt.id}
                                  onClick={() => handleStatusChange(apt.id, "Confirmed")}
                                  className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors shadow-2xs disabled:opacity-50"
                                  title="Mark as Confirmed"
                                >
                                  Confirm
                                </button>
                              )}
                              <select
                                disabled={updatingId === apt.id}
                                value={apt.status}
                                onChange={(e) => handleStatusChange(apt.id, e.target.value as AppointmentStatus)}
                                className="text-[10px] font-medium bg-white border border-[var(--mist)] rounded-lg px-2 py-1 outline-none hover:border-[var(--primary)]"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="No-show">No-show</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-[var(--cloud)]/30 border-t border-[var(--mist)] text-right">
              <Link href="/bookings" className="text-xs text-[var(--slate)] hover:text-[var(--navy-950)]">
                View all historical &amp; upcoming bookings →
              </Link>
            </div>
          </div>

          <div className="card p-4 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--mist)]">
              <h2 className="font-display font-semibold text-sm text-[var(--navy-950)]">
                Doctor Availability (Today)
              </h2>
              <Link
                href="/schedules"
                className="text-xs text-[var(--primary)] hover:underline font-semibold"
              >
                Calendar
              </Link>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {!doctors || doctors.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--slate)] bg-[var(--cloud)] rounded-xl">
                  {isLoading ? "Loading doctor status..." : "No doctors registered yet."}
                </div>
              ) : (
                doctors.map((doc) => {
                  const ex = exceptions.find((e) => e.doctorId === doc.id && e.date === todayStr);
                  const isUnavailable = ex && ex.type === "full_day_unavailable";

                  return (
                    <Link
                      key={doc.id}
                      href="/schedules"
                      className="p-2.5 rounded-xl border border-[var(--mist)] hover:border-[var(--primary)] transition-colors flex items-center justify-between text-xs block"
                    >
                      <div>
                        <p className="font-semibold text-[var(--navy-950)] leading-tight">{doc.name}</p>
                        <p className="text-[10px] text-[var(--slate)]">{doc.departmentSlug}</p>
                      </div>

                      <div className="text-right">
                        {isUnavailable ? (
                          <span className="chip text-[9px] font-bold py-0.5 px-2 bg-red-50 text-red-700 border-red-200">
                            {ex.reason || "On Leave"}
                          </span>
                        ) : (
                          <span className="chip text-[9px] font-bold py-0.5 px-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                            Available
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Volume & Recent Patients */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-5 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-4">
            <h3 className="font-display font-semibold text-sm text-[var(--navy-950)]">
              This Week&apos;s Booking Volume
            </h3>

            <div className="grid grid-cols-7 gap-1 text-center pt-2">
              {metrics.forecast7Days.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-[var(--slate)] font-semibold">{d.dayLabel}</span>
                  <div
                    className={`w-full py-3 rounded-xl border flex flex-col items-center justify-center ${
                      i === 0
                        ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
                        : "bg-[var(--cloud)] border-[var(--mist)] text-[var(--navy-950)]"
                    }`}
                  >
                    <span className="font-bold text-sm">{d.count}</span>
                  </div>
                  <span className="text-[9px] text-[var(--slate)]">{d.dateStr.slice(8)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 card p-5 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--mist)]">
              <h3 className="font-display font-semibold text-sm text-[var(--navy-950)]">
                Recent Patient Registrations
              </h3>
              <Link
                href="/patients"
                className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                <span>View All Patients</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {metrics.recentRegistrations.length === 0 ? (
                <div className="col-span-2 py-6 text-center text-xs text-[var(--slate)]">
                  {isLoading ? "Loading recent records..." : "No patient records registered yet."}
                </div>
              ) : (
                metrics.recentRegistrations.slice(0, 4).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl border border-[var(--mist)] bg-[var(--cloud)]/30 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[var(--navy-950)]">{apt.patientName}</p>
                      <span className="font-mono text-[10px] text-[var(--slate)]">{apt.bookingReference}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[var(--slate)]">
                      <span className="flex items-center gap-1">
                        <Phone size={11} className="text-[var(--primary)]" />
                        {apt.patientPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-[var(--primary)]" />
                        {formatDisplayDate(apt.preferredDate)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
