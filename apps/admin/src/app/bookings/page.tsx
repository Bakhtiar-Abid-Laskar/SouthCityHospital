"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  CalendarCheck,
  User,
  Clock,
  FileSpreadsheet,
  Stethoscope,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { BookingSearchBar } from "@/components/BookingSearchBar";
import { getBookingsForDate, updateBookingStatus } from "@/services/admin-bookings";
import { useDoctors } from "@/services/doctors";
import { useDepartments } from "@/services/departments";
import { formatDisplayDate } from "@/lib/date-utils";
import { exportSingleDoctorBookingsXlsx, exportAllDoctorsGroupedXlsx } from "@/lib/excel-export";
import type { Appointment, AppointmentStatus, UserRole } from "@sch/types";

export default function BookingsHubPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [viewMode, setViewMode] = useState<"all" | "byDoctor">("all");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("all");
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>("staff");
  const [isExporting, setIsExporting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const { data: doctors } = useDoctors({ activeOnly: false });
  const { departments } = useDepartments();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUserRole(data.user.role);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const filterDocId = viewMode === "byDoctor" ? selectedDoctorId : "all";
    getBookingsForDate(selectedDate, filterDocId)
      .then((data) => setBookings(data))
      .catch(() => setBookings([]))
      .finally(() => setIsLoading(false));
  }, [selectedDate, viewMode, selectedDoctorId]);

  const selectedDoctorObj = doctors?.find((d) => d.id === selectedDoctorId);
  const selectedDeptObj = selectedDoctorObj
    ? departments.find((dept) => dept.slug === selectedDoctorObj.departmentSlug)
    : null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (viewMode === "byDoctor" && selectedDoctorObj) {
        await exportSingleDoctorBookingsXlsx(
          selectedDoctorObj,
          selectedDeptObj?.name || "Specialist",
          selectedDate,
          bookings
        );
      } else {
        await exportAllDoctorsGroupedXlsx(selectedDate, bookings, doctors || []);
      }
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    setStatusUpdatingId(appointmentId);
    try {
      await updateBookingStatus(appointmentId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === appointmentId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error("Status update error", err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout userRole={userRole}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-[var(--slate)]">Loading bookings data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-[var(--navy-950)]">
              Bookings Hub
            </h1>
            <p className="text-xs text-[var(--slate)] mt-0.5">
              Daily appointments, search, and department rosters.
            </p>
          </div>

          <div className="w-full md:w-96">
            <BookingSearchBar />
          </div>
        </div>

        <div className="card p-4 bg-white border border-[var(--mist)] rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[var(--cloud)] px-3 py-1.5 rounded-xl border border-[var(--mist)]">
              <Calendar size={16} className="text-[var(--primary)]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[var(--navy-950)] outline-none"
              />
            </div>

            <div className="flex rounded-xl bg-[var(--cloud)] p-1 border border-[var(--mist)] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`py-1.5 px-3 rounded-lg transition-all ${
                  viewMode === "all"
                    ? "bg-white text-[var(--navy-950)] shadow-xs"
                    : "text-[var(--slate)] hover:text-[var(--navy-950)]"
                }`}
              >
                All Bookings ({bookings.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode("byDoctor")}
                className={`py-1.5 px-3 rounded-lg transition-all ${
                  viewMode === "byDoctor"
                    ? "bg-white text-[var(--navy-950)] shadow-xs"
                    : "text-[var(--slate)] hover:text-[var(--navy-950)]"
                }`}
              >
                By Doctor
              </button>
            </div>

            {viewMode === "byDoctor" && (
              <div className="flex items-center gap-1.5 bg-[var(--cloud)] px-3 py-1.5 rounded-xl border border-[var(--mist)]">
                <Stethoscope size={15} className="text-[var(--primary)] shrink-0" />
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[var(--navy-950)] outline-none"
                >
                  <option value="all">All Specialists</option>
                  {doctors?.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.departmentSlug})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn btn-outline text-xs py-2 px-4 gap-2 border-[var(--mist)] hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition-colors self-start md:self-auto shrink-0"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>
              {isExporting
                ? "Generating..."
                : viewMode === "byDoctor" && selectedDoctorObj
                ? `Export ${selectedDoctorObj.name} (.xlsx)`
                : "Export All Doctors (.xlsx)"}
            </span>
          </button>
        </div>

        <div className="card bg-white border border-[var(--mist)] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[var(--mist)] flex items-center justify-between">
            <h2 className="font-display font-semibold text-sm text-[var(--navy-950)]">
              Appointments for {formatDisplayDate(selectedDate)}
            </h2>
            <span className="text-xs text-[var(--slate)]">
              {bookings.length} {bookings.length === 1 ? "record" : "records"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--cloud)]/60 text-[var(--slate)] font-bold border-b border-[var(--mist)] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Time Preference</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Doctor &amp; Specialty</th>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Status</th>
                  {userRole === "admin" && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--mist)]">
                {isLoading ? (
                  <tr>
                    <td colSpan={userRole === "admin" ? 7 : 6} className="py-12 text-center text-[var(--slate)]">
                      <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span>Loading appointments...</span>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={userRole === "admin" ? 7 : 6} className="py-12 text-center text-[var(--slate)]">
                      <CalendarCheck size={32} className="mx-auto mb-2 text-[var(--mist)]" />
                      <p className="font-semibold text-[var(--navy-950)]">No appointments scheduled</p>
                      <p className="text-[11px] mt-0.5">
                        {viewMode === "byDoctor" && selectedDoctorObj
                          ? `No bookings for ${selectedDoctorObj.name} on this date.`
                          : "No bookings recorded across the hospital for this date."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  bookings.map((apt) => (
                    <tr key={apt.id} className="hover:bg-[var(--cloud)]/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[var(--navy-950)] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-[var(--primary)] shrink-0" />
                          <span className={!apt.preferredTimeSlot ? "text-[var(--slate)] font-normal italic" : ""}>
                            {apt.preferredTimeSlot || "Not specified"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-[var(--navy-950)]">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-[var(--slate)] shrink-0" />
                          <span>{apt.patientName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[var(--slate)] whitespace-nowrap">
                        {apt.patientPhone}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-medium text-[var(--navy-950)] leading-tight">{apt.doctorName}</p>
                        <p className="text-[10px] text-[var(--slate)]">{apt.departmentName}</p>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[var(--navy-950)] whitespace-nowrap">
                        {apt.bookingReference}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`chip text-[10px] font-bold py-0.5 px-2.5 rounded-md ${
                            apt.status === "Confirmed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : apt.status === "Cancelled"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : apt.status === "Completed"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-800 border border-amber-300 font-extrabold"
                          }`}
                        >
                          {apt.status === "Pending" ? "● Pending" : apt.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {apt.status === "Pending" && (
                            <button
                              type="button"
                              disabled={statusUpdatingId === apt.id}
                              onClick={() => handleStatusChange(apt.id, "Confirmed")}
                              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-2xs flex items-center gap-1 disabled:opacity-50"
                              title="Mark as Confirmed"
                            >
                              <span>Confirm</span>
                            </button>
                          )}
                          <select
                            disabled={statusUpdatingId === apt.id}
                            value={apt.status}
                            onChange={(e) => handleStatusChange(apt.id, e.target.value as AppointmentStatus)}
                            className="text-[11px] font-medium bg-white border border-[var(--mist)] rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-[var(--primary)]"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="No-show">No-show</option>
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
      </div>
    </AdminLayout>
  );
}
