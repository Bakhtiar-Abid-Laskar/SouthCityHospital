"use client";

import { useState, useEffect } from "react";
import {
  BellRing,
  Search,
  RefreshCw,
  Phone,
  User,
  Download,
  Trash2,
  Copy,
  Check,
  Calendar,
  Users,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { fetchSubscribers, deleteSubscriber, type Subscriber } from "@/services/subscribers";

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSubscribers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSubscribers();
      setSubscribers(data);
    } catch (err) {
      console.error("Subscribers fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the subscribers list?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteSubscriber(id);
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete subscriber. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;

    const headers = ["Name", "Phone Number", "Registered At", "Last Updated"];
    const rows = subscribers.map((s) => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.phone_number}"`,
      `"${new Date(s.created_at).toLocaleString()}"`,
      `"${new Date(s.updated_at).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `subscribers-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubscribers = subscribers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone_number.includes(searchQuery)
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BellRing className="h-5 w-5" />
              </div>
              <span>Subscribers</span>
              <span className="ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {subscribers.length} total
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Visitors registered through the &ldquo;Stay Updated&rdquo; popup for health announcements and hospital updates.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              disabled={subscribers.length === 0}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download CSV for SMS/WhatsApp broadcasts"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={loadSubscribers}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ── Main Content Card ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or 10-digit phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all"
              />
            </div>
            <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
              {filteredSubscribers.length} {filteredSubscribers.length === 1 ? "subscriber" : "subscribers"}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold w-12 text-center">#</th>
                  <th className="px-6 py-4 font-semibold">Subscriber Name</th>
                  <th className="px-6 py-4 font-semibold">Phone Number</th>
                  <th className="px-6 py-4 font-semibold">Registration Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                      Loading subscribers...
                    </td>
                  </tr>
                ) : filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-base font-medium text-gray-900">
                        {searchQuery ? "No matching subscribers found" : "No subscribers yet"}
                      </p>
                      <p className="text-sm mt-1">
                        {searchQuery
                          ? "Try checking for typos or searching by name."
                          : "Subscribers will appear here when visitors sign up via the popup."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((subscriber, index) => {
                    const initials = subscriber.name
                      .split(" ")
                      .map((n) => n[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <tr key={subscriber.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Index */}
                        <td className="px-6 py-4 text-center text-xs text-gray-400 font-mono">
                          {index + 1}
                        </td>

                        {/* Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center shrink-0">
                              {initials || <User size={14} />}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {subscriber.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${subscriber.phone_number}`}
                              className="font-mono text-sm font-medium text-gray-800 hover:text-blue-600 hover:underline flex items-center gap-1.5"
                            >
                              <Phone size={13} className="text-gray-400" />
                              {subscriber.phone_number}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyPhone(subscriber.phone_number)}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                              title="Copy phone number"
                              aria-label={`Copy ${subscriber.phone_number}`}
                            >
                              {copiedPhone === subscriber.phone_number ? (
                                <Check size={14} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar size={13} className="text-gray-400" />
                            <span>
                              {new Date(subscriber.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 pl-5">
                            {new Date(subscriber.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(subscriber.id, subscriber.name)}
                            disabled={deletingId === subscriber.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium"
                            title="Remove subscriber"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}