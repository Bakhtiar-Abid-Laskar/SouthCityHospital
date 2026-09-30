"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  Key,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import type { StaffAccount, UserRole } from "@sch/types";

export default function StaffManagementPage() {
  const [accounts, setAccounts] = useState<StaffAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetModalAccount, setResetModalAccount] = useState<StaffAccount | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("staff");
  const [newPassword, setNewPassword] = useState("");
  const [resetPasswordVal, setResetPasswordVal] = useState("");

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/staff", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.accounts)) {
        setAccounts(data.accounts);
      } else {
        setAccounts([]);
      }
    } catch {
      setAccounts([]);
    } finally {
      setIsLoading(false);
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

    loadAccounts();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          fullName: newName,
          role: newRole,
          password: newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFeedback({ type: "error", message: data.error || "Failed to create account." });
        return;
      }

      setFeedback({ type: "success", message: `Account created successfully for ${data.account?.fullName || newName}.` });
      setShowCreateModal(false);
      setNewEmail("");
      setNewName("");
      setNewPassword("");
      loadAccounts();
    } catch {
      setFeedback({ type: "error", message: "Network error creating account." });
    }
  };

  const handleToggleActive = async (account: StaffAccount) => {
    setFeedback(null);
    try {
      const res = await fetch("/api/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: account.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: "error", message: data.error || "Failed to update account status." });
        return;
      }
      setFeedback({
        type: "success",
        message: `Account for ${account.fullName} has been ${account.isActive ? "deactivated" : "reactivated"}.`,
      });
      loadAccounts();
    } catch {
      setFeedback({ type: "error", message: "Network error updating account status." });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalAccount) return;
    setFeedback(null);

    try {
      const res = await fetch("/api/staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: resetModalAccount.id,
          newPassword: resetPasswordVal,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: "error", message: data.error || "Failed to reset password." });
        return;
      }

      setFeedback({ type: "success", message: `Password reset successfully for ${resetModalAccount.fullName}.` });
      setResetModalAccount(null);
      setResetPasswordVal("");
    } catch {
      setFeedback({ type: "error", message: "Network error resetting password." });
    }
  };

  if (currentRole !== "admin") {
    return (
      <AdminLayout userRole="staff">
        <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
          <AlertCircle size={36} className="text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-red-800">403 — Access Forbidden</h2>
          <p className="text-xs text-[var(--slate)] mt-1">Staff accounts do not have permission to manage accounts.</p>
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
              Staff &amp; Admin Accounts
            </h1>
            <p className="text-xs text-[var(--slate)] mt-0.5">
              Manage portal user roles, security credentials, and access activation.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary text-xs py-2.5 px-4 gap-2 self-start sm:self-auto"
          >
            <UserPlus size={16} />
            <span>Create New Account</span>
          </button>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="card bg-white border border-[var(--mist)] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[var(--mist)] flex items-center justify-between">
            <h2 className="font-display font-semibold text-sm text-[var(--navy-950)]">
              Authorized Personnel ({accounts.length})
            </h2>
            <span className="text-xs text-[var(--slate)]">
              {accounts.filter((a) => a.isActive).length} Active Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--cloud)]/60 text-[var(--slate)] font-bold border-b border-[var(--mist)] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--mist)]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[var(--slate)]">
                      Loading staff accounts...
                    </td>
                  </tr>
                ) : (
                  accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-[var(--cloud)]/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[var(--navy-950)]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[var(--cloud)] border border-[var(--mist)] flex items-center justify-center text-[var(--navy-950)] font-bold text-xs">
                            {acc.fullName.charAt(0)}
                          </div>
                          <span>{acc.fullName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[var(--slate)]">{acc.email}</td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`chip text-[10px] font-bold py-0.5 px-2 uppercase ${
                            acc.role === "admin"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {acc.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            acc.isActive ? "text-emerald-700" : "text-red-600"
                          }`}
                        >
                          {acc.isActive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Deactivated
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[var(--slate)]">
                        {acc.lastLoginAt ? new Date(acc.lastLoginAt).toLocaleString() : "Never"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setResetModalAccount(acc)}
                            className="btn btn-outline text-[11px] py-1 px-2.5 gap-1"
                            title="Reset Password"
                          >
                            <Key size={12} />
                            <span>Reset Pass</span>
                          </button>

                          <button
                            onClick={() => handleToggleActive(acc)}
                            className={`btn text-[11px] py-1 px-2.5 ${
                              acc.isActive
                                ? "btn-outline border-red-200 text-red-600 hover:bg-red-50"
                                : "btn-primary bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                          >
                            {acc.isActive ? "Deactivate" : "Reactivate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-[var(--mist)]">
              <h3 className="font-display font-bold text-lg text-[var(--navy-950)] mb-1">
                Create Staff / Admin Account
              </h3>
              <p className="text-xs text-[var(--slate)] mb-4">
                Provision new operational credentials. Public registration is strictly disabled.
              </p>

              <form onSubmit={handleCreateAccount} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    required
                    className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="priya@southcityhospital.in"
                    required
                    className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                    Role &amp; Permissions
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none bg-white font-medium"
                  >
                    <option value="staff">Staff (Bookings Hub, Search &amp; Exports only)</option>
                    <option value="admin">Administrator (Full System &amp; Doctor Control)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-ghost text-xs py-2 px-3"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary text-xs py-2 px-4">
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {resetModalAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-[var(--mist)]">
              <h3 className="font-display font-bold text-lg text-[var(--navy-950)] mb-1">
                Reset Password
              </h3>
              <p className="text-xs text-[var(--slate)] mb-4">
                Set a new password for <strong>{resetModalAccount.fullName}</strong> ({resetModalAccount.email}).
              </p>

              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-[var(--mist)] focus:border-[var(--primary)] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setResetModalAccount(null)}
                    className="btn btn-ghost text-xs py-2 px-3"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary text-xs py-2 px-4">
                    Save New Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
