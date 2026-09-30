"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Ban,
  ChevronLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { useDoctors } from "@/services/doctors";
import { format12Hour, formatDisplayDate } from "@/lib/date-utils";
import {
  fetchWeeklySchedules,
  saveWeeklySchedules,
  fetchDoctorExceptions,
  addOrUpdateException,
  removeException,
} from "@/services/doctor-schedules";
import { fetchDoctorAvailabilityRange } from "@/services/slots";
import { exportSingleDoctorBookingsXlsx } from "@/lib/excel-export";
import { getBookingsForDate } from "@/services/admin-bookings";
import { useDepartments } from "@/services/departments";
import type {
  DoctorWeeklySchedule,
  DoctorAvailabilityException,
  ExceptionType,
  DayOfWeek,
  UserRole,
} from "@sch/types";

const DAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AdminSchedulesPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const { data: doctors, isLoading: isDoctorsLoading } = useDoctors({ activeOnly: false });
  const { departments } = useDepartments();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [weeklySchedules, setWeeklySchedules] = useState<DoctorWeeklySchedule[]>([]);
  const [exceptions, setExceptions] = useState<DoctorAvailabilityException[]>([]);
  const [activeTab, setActiveTab] = useState<"weekly" | "calendar">("calendar");
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [viewDate, setViewDate] = useState(() => new Date());

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [exceptionType, setExceptionType] = useState<ExceptionType>("full_day_unavailable");
  const [exceptionReason, setExceptionReason] = useState("");
  const [exceptionStart, setExceptionStart] = useState("09:00");
  const [exceptionEnd, setExceptionEnd] = useState("13:00");

  const [previewAvailability, setPreviewAvailability] = useState<{available: boolean, start_time: string|null, end_time: string|null, reason: string|null} | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const [newDay, setNewDay] = useState<DayOfWeek>("Monday");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("13:00");

  const loadData = async (docId?: string) => {
    setIsLoadingSchedules(true);
    try {
      const [scheds, excs] = await Promise.all([
        fetchWeeklySchedules(docId),
        fetchDoctorExceptions(docId),
      ]);
      setWeeklySchedules(scheds);
      setExceptions(excs);
    } catch (err) {
      console.error("Failed to load schedules:", err);
    } finally {
      setIsLoadingSchedules(false);
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
  }, []);

  useEffect(() => {
    if (doctors && doctors.length > 0) {
      if (!selectedDoctorId || !doctors.some((d) => d.id === selectedDoctorId)) {
        setSelectedDoctorId(doctors[0].id);
      }
    } else {
      setSelectedDoctorId("");
    }
  }, [doctors, selectedDoctorId]);

  useEffect(() => {
    if (selectedDoctorId) {
      loadData(selectedDoctorId);
    }
  }, [selectedDoctorId]);

  useEffect(() => {
    if (selectedDoctorId && selectedDateStr) {
      setIsLoadingPreview(true);
      fetchDoctorAvailabilityRange(selectedDoctorId, selectedDateStr)
        .then((res) => {
          setPreviewAvailability({
            available: res.available,
            start_time: res.start_time,
            end_time: res.end_time,
            reason: res.reason,
          });
        })
        .finally(() => setIsLoadingPreview(false));
    } else {
      setPreviewAvailability(null);
    }
  }, [selectedDoctorId, selectedDateStr, exceptions, weeklySchedules]);

  const currentDoctor = doctors?.find((d) => d.id === selectedDoctorId);
  const currentDept = currentDoctor
    ? departments.find((dept) => dept.slug === currentDoctor.departmentSlug)
    : null;

  const doctorWeeklySchedules = weeklySchedules.filter((s) => s.doctorId === selectedDoctorId);
  const doctorExceptions = exceptions.filter((e) => e.doctorId === selectedDoctorId);

  const handleAddWeeklySlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) return;

    const newSlot: DoctorWeeklySchedule = {
      id: `ws-${Date.now()}`,
      doctorId: selectedDoctorId,
      dayOfWeek: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
      slotDurationMinutes: 30, // Deprecated: Kept for DB constraint
      isActive: true,
    };

    const updated = [...doctorWeeklySchedules, newSlot];
    const res = await saveWeeklySchedules(selectedDoctorId, updated);

    if (res.success) {
      setWeeklySchedules(updated);
      setFeedback(`Weekly slot added for ${newDay} (${format12Hour(newStartTime)}–${format12Hour(newEndTime)}).`);
    } else {
      setFeedback(`Error saving schedule: ${res.error}`);
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRemoveWeeklySlot = async (id: string) => {
    const updated = doctorWeeklySchedules.filter((s) => s.id !== id);
    const res = await saveWeeklySchedules(selectedDoctorId, updated);

    if (res.success) {
      setWeeklySchedules(updated);
      setFeedback("Weekly schedule updated.");
    } else {
      setFeedback(`Error removing slot: ${res.error}`);
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const existing = doctorExceptions.find((e) => e.date === dateStr);
    if (existing) {
      setExceptionType(existing.type);
      setExceptionReason(existing.reason || "");
      setExceptionStart(existing.startTime || "09:00");
      setExceptionEnd(existing.endTime || "13:00");
    } else {
      setExceptionType("full_day_unavailable");
      setExceptionReason("On Leave");
      setExceptionStart("09:00");
      setExceptionEnd("13:00");
    }
  };

  const handleSaveException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedDateStr) return;

    const newEx: DoctorAvailabilityException = {
      id: `ex-${selectedDoctorId}-${selectedDateStr}`,
      doctorId: selectedDoctorId,
      date: selectedDateStr,
      type: exceptionType,
      reason: exceptionReason.trim() || null,
      startTime: exceptionType !== "full_day_unavailable" ? exceptionStart : null,
      endTime: exceptionType !== "full_day_unavailable" ? exceptionEnd : null,
      createdAt: new Date().toISOString(),
    };

    const res = await addOrUpdateException(newEx);
    if (res.success) {
      await loadData(selectedDoctorId);
      setSelectedDateStr(null);
      setFeedback(`Availability exception saved for ${formatDisplayDate(selectedDateStr)}.`);
    } else {
      setFeedback(`Error saving exception: ${res.error}`);
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleClearException = async () => {
    if (!selectedDoctorId || !selectedDateStr) return;
    const res = await removeException(selectedDoctorId, selectedDateStr);
    if (res.success) {
      await loadData(selectedDoctorId);
      setSelectedDateStr(null);
      setFeedback(`Exception cleared. Default schedule restored for ${formatDisplayDate(selectedDateStr)}.`);
    } else {
      setFeedback(`Error clearing exception: ${res.error}`);
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleExportDoctorDay = async (dateStr: string) => {
    if (!currentDoctor) return;
    const appointments = await getBookingsForDate(dateStr, currentDoctor.id);
    await exportSingleDoctorBookingsXlsx(currentDoctor, currentDept?.name || "Specialist", dateStr, appointments);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = viewDate.toLocaleString("default", { month: "long" });

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  if (currentRole !== "admin") {
    return (
      <AdminLayout userRole="staff">
        <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
          <AlertCircle size={36} className="text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-red-800">403 — Access Forbidden</h2>
          <p className="text-xs text-[var(--slate)] mt-1">Staff accounts cannot configure doctor schedules.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--navy-950)]">
            Schedules &amp; Availability Calendar
          </h1>
          <p className="text-xs text-[var(--slate)] mt-0.5">
            Configure weekly recurring consultation windows and set date-specific leave or custom hours.
          </p>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Doctor Selector Ribbon */}
        <div className="card p-4 bg-white border border-[var(--mist)] rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-semibold text-[var(--slate)]">Select Physician:</span>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="text-xs font-semibold text-[var(--navy-950)] bg-[var(--cloud)] border border-[var(--mist)] rounded-xl px-3 py-2 outline-none focus:border-[var(--primary)]"
            >
              {doctors?.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({departments.find((d) => d.slug === doc.departmentSlug)?.name || doc.departmentSlug})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadData(selectedDoctorId)}
              disabled={isLoadingSchedules}
              className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 border-[var(--mist)] bg-white hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw size={13} className={isLoadingSchedules ? "animate-spin text-[var(--primary)]" : ""} />
              <span>Sync Live DB</span>
            </button>

            <div className="flex bg-[var(--cloud)] p-1 rounded-xl border border-[var(--mist)]">
              <button
                type="button"
                onClick={() => setActiveTab("calendar")}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeTab === "calendar"
                    ? "bg-white text-[var(--primary)] shadow-xs"
                    : "text-[var(--slate)] hover:text-[var(--navy-950)]"
                }`}
              >
                Calendar &amp; Leaves
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("weekly")}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeTab === "weekly"
                    ? "bg-white text-[var(--primary)] shadow-xs"
                    : "text-[var(--slate)] hover:text-[var(--navy-950)]"
                }`}
              >
                Weekly Roster
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Calendar & Leaves */}
        {activeTab === "calendar" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-5 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--mist)]">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={18} className="text-[var(--primary)]" />
                  <h2 className="font-display font-bold text-base text-[var(--navy-950)]">
                    {monthName} {year}
                  </h2>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg border border-[var(--mist)] hover:bg-[var(--cloud)] text-[var(--slate)]"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg border border-[var(--mist)] hover:bg-[var(--cloud)] text-[var(--slate)]"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Day names header */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-[var(--slate)] uppercase">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[96px] bg-[var(--cloud)]/20 rounded-xl border border-transparent" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                  const ex = doctorExceptions.find((e) => e.date === dateStr);
                  const isSelected = selectedDateStr === dateStr;

                  const dayDate = new Date(year, month, dayNum);
                  const currentDayOfWeek = DAYS[dayDate.getDay() === 0 ? 6 : dayDate.getDay() - 1]; // DAYS is Mon-Sun, getDay is Sun=0
                  const daySchedule = doctorWeeklySchedules.find((s) => s.dayOfWeek === currentDayOfWeek);
                  const isLeave = ex && ex.type === "full_day_unavailable";
                  const isModified = ex && ex.type !== "full_day_unavailable";
                  
                  const displayStart = (isModified && ex.type === "custom_hours" && ex.startTime) ? ex.startTime : daySchedule?.startTime;
                  const displayEnd = (isModified && ex.type === "custom_hours" && ex.endTime) ? ex.endTime : daySchedule?.endTime;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => handleDateClick(dateStr)}
                      className={`min-h-[96px] p-1.5 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                        isSelected
                          ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20 bg-sky-50/50"
                          : isLeave
                            ? "bg-red-50 border-red-200"
                            : isModified
                              ? "bg-orange-50 border-orange-200 shadow-sm"
                              : daySchedule
                                ? "bg-emerald-50 border-emerald-200 shadow-sm"
                                : "bg-white border-[var(--mist)] hover:border-slate-300"
                      }`}
                    >
                      <span className="font-bold text-xs text-[var(--navy-950)] mb-1">{dayNum}</span>

                      {!isLeave && displayStart && displayEnd && (
                        <div className="w-full text-center mt-auto">
                          <div className={`text-[11px] font-bold px-1 py-1 rounded w-full flex flex-col items-center justify-center leading-tight shadow-sm ${
                            isModified ? "bg-orange-100 text-orange-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            <span>{format12Hour(displayStart)}</span>
                            <span className="text-[9px] opacity-70 font-semibold my-0.5">to</span>
                            <span>{format12Hour(displayEnd)}</span>
                          </div>
                        </div>
                      )}

                      {ex && (
                        <div className="w-full truncate mt-auto">
                          <span
                            className={`chip text-[9px] font-bold py-0.2 px-1 block truncate text-center ${
                              ex.type === "full_day_unavailable"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ex.reason || (ex.type === "full_day_unavailable" ? "On Leave" : "Custom")}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exception Drawer/Form */}
            <div className="card p-5 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-4">
              {!selectedDateStr ? (
                <div className="text-center py-12 text-[var(--slate)] space-y-2">
                  <CalendarIcon size={32} className="mx-auto text-[var(--slate)]/60" />
                  <p className="text-xs">Click any calendar date to add leave, partial hours, or export schedule.</p>
                </div>
              ) : (
                <form onSubmit={handleSaveException} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--mist)]">
                    <div>
                      <h3 className="font-display font-semibold text-sm text-[var(--navy-950)]">
                        {formatDisplayDate(selectedDateStr)}
                      </h3>
                      <p className="text-[11px] text-[var(--slate)]">{currentDoctor?.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDateStr(null)}
                      className="text-[var(--slate)] hover:text-[var(--navy-950)]"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Live Preview Widget */}
                  <div className="bg-[var(--cloud)] rounded-xl border border-[var(--mist)] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--slate)]">
                        Live Availability Preview
                      </p>
                      {isLoadingPreview && (
                        <div className="w-3 h-3 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                    
                    {!isLoadingPreview && previewAvailability && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          {previewAvailability.available ? (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          ) : (
                            <Ban size={16} className="text-red-500" />
                          )}
                          <span className={`text-sm font-bold ${previewAvailability.available ? 'text-emerald-700' : 'text-red-700'}`}>
                            {previewAvailability.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        {previewAvailability.available && previewAvailability.start_time && previewAvailability.end_time && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--navy-950)] bg-white border border-[var(--mist)] rounded-lg px-2 py-1 w-fit">
                            <Clock size={13} className="text-[var(--primary)]" />
                            <span>{previewAvailability.start_time} – {previewAvailability.end_time}</span>
                          </div>
                        )}
                        {previewAvailability.reason && (
                          <p className="text-[11px] text-[var(--slate)] italic mt-1 leading-tight">
                            Note: {previewAvailability.reason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                      Exception Type
                    </label>
                    <select
                      value={exceptionType}
                      onChange={(e) => setExceptionType(e.target.value as ExceptionType)}
                      className="w-full text-xs bg-white border border-[var(--mist)] rounded-xl px-3 py-2 outline-none focus:border-[var(--primary)]"
                    >
                      <option value="full_day_unavailable">Full Day Unavailable (Leave / Block)</option>
                      <option value="partial_unavailable">Partial Unavailable (Shift Adjustment)</option>
                      <option value="custom_hours">Custom Operating Hours</option>
                    </select>
                  </div>

                  {exceptionType !== "full_day_unavailable" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-[var(--slate)] mb-1">Start Time</label>
                        <input
                          type="time"
                          value={exceptionStart}
                          onChange={(e) => setExceptionStart(e.target.value)}
                          className="w-full text-xs border border-[var(--mist)] rounded-xl px-2 py-1.5 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[var(--slate)] mb-1">End Time</label>
                        <input
                          type="time"
                          value={exceptionEnd}
                          onChange={(e) => setExceptionEnd(e.target.value)}
                          className="w-full text-xs border border-[var(--mist)] rounded-xl px-2 py-1.5 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                      Reason / Display Note
                    </label>
                    <input
                      type="text"
                      value={exceptionReason}
                      onChange={(e) => setExceptionReason(e.target.value)}
                      placeholder="e.g. Conference, Medical Leave, Emergency..."
                      className="w-full text-xs border border-[var(--mist)] rounded-xl px-3 py-2 outline-none focus:border-[var(--primary)]"
                    />
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button type="submit" className="btn btn-primary text-xs py-2 w-full justify-center">
                      Save Exception to Database
                    </button>

                    {doctorExceptions.some((e) => e.date === selectedDateStr) && (
                      <button
                        type="button"
                        onClick={handleClearException}
                        className="btn btn-outline text-xs py-2 w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Remove Leave &amp; Restore Schedule
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleExportDoctorDay(selectedDateStr)}
                      className="btn btn-outline text-xs py-2 w-full justify-center flex items-center gap-1.5 border-[var(--mist)] text-[var(--navy-950)] hover:bg-slate-50"
                    >
                      <FileSpreadsheet size={14} className="text-emerald-600" />
                      <span>Export Day&apos;s Appointments (Excel)</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Weekly Roster */}
        {activeTab === "weekly" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-5 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--mist)]">
                <h2 className="font-display font-semibold text-sm text-[var(--navy-950)]">
                  Recurring Weekly Shift Windows — {currentDoctor?.name}
                </h2>
                <span className="chip chip-diagnostic text-xs py-0.5 px-2">
                  {doctorWeeklySchedules.length} recurring {doctorWeeklySchedules.length === 1 ? "slot" : "slots"}
                </span>
              </div>

              <div className="space-y-2">
                {doctorWeeklySchedules.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[var(--slate)] bg-[var(--cloud)]/30 rounded-xl">
                    No weekly recurring slots assigned. Default hospital 24x7 OPD availability will apply.
                  </div>
                ) : (
                  doctorWeeklySchedules.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 rounded-xl border border-[var(--mist)] flex items-center justify-between bg-white hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-xs text-[var(--navy-950)] w-24">
                          {slot.dayOfWeek}
                        </span>
                        <span className="text-xs text-[var(--slate)] font-mono">
                          {format12Hour(slot.startTime)} – {format12Hour(slot.endTime)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveWeeklySlot(slot.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete slot"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Slot Form */}
            <div className="card p-5 bg-white border border-[var(--mist)] rounded-2xl shadow-xs space-y-4">
              <h3 className="font-display font-semibold text-sm text-[var(--navy-950)] pb-2 border-b border-[var(--mist)]">
                Add Weekly Shift
              </h3>

              <form onSubmit={handleAddWeeklySlot} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                    Day of Week
                  </label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as DayOfWeek)}
                    className="w-full text-xs bg-white border border-[var(--mist)] rounded-xl px-3 py-2 outline-none focus:border-[var(--primary)]"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[var(--slate)] mb-1">Start Time</label>
                    <input
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full text-xs border border-[var(--mist)] rounded-xl px-2 py-1.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--slate)] mb-1">End Time</label>
                    <input
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full text-xs border border-[var(--mist)] rounded-xl px-2 py-1.5 outline-none"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary text-xs py-2 w-full justify-center mt-2">
                  <Plus size={14} />
                  <span>Save Weekly Shift</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
