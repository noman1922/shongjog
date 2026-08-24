"use client";

import {
  Ban,
  Building2,
  CheckCircle2,
  GraduationCap,
  Loader2,
  MoreHorizontal,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserRoundX,
  XCircle,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import {
  deleteUserAccountAction,
  setUserRoleAction,
  toggleUserStatusAction,
  toggleVerifiedMentorAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { AdminUserSummary } from "@/lib/admin/data";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
}

export function UserManagementTable({
  users: initialUsers,
  currentAdminId,
}: {
  users: AdminUserSummary[];
  currentAdminId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<"all" | "student" | "alumni" | "admin">("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ error?: string; message?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = selectedRole === "all" || u.role === selectedRole;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        u.fullName.toLowerCase().includes(term) ||
        (u.username && u.username.toLowerCase().includes(term)) ||
        u.email.toLowerCase().includes(term) ||
        (u.universityName && u.universityName.toLowerCase().includes(term)) ||
        (u.companyName && u.companyName.toLowerCase().includes(term));

      return matchesRole && matchesSearch;
    });
  }, [users, selectedRole, searchTerm]);

  const counts = useMemo(() => {
    return {
      admin: users.filter((u) => u.role === "admin").length,
      all: users.length,
      alumni: users.filter((u) => u.role === "alumni").length,
      student: users.filter((u) => u.role === "student").length,
    };
  }, [users]);

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setFeedback(null);
    setActionLoadingId(userId);

    startTransition(async () => {
      const res = await toggleUserStatusAction(userId, nextStatus);
      setActionLoadingId(null);
      if (res.error) {
        setFeedback({ error: res.error });
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: nextStatus } : u))
        );
        setFeedback({ message: res.message });
      }
    });
  };

  const handleRoleChange = (userId: string, newRole: "student" | "alumni" | "admin") => {
    setFeedback(null);
    setActionLoadingId(userId);

    startTransition(async () => {
      const res = await setUserRoleAction(userId, newRole);
      setActionLoadingId(null);
      if (res.error) {
        setFeedback({ error: res.error });
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        setFeedback({ message: res.message });
      }
    });
  };

  const handleToggleMentor = (userId: string, currentRole: string) => {
    const isAlumni = currentRole === "alumni";
    setFeedback(null);
    setActionLoadingId(userId);

    startTransition(async () => {
      const res = await toggleVerifiedMentorAction(userId, !isAlumni);
      setActionLoadingId(null);
      if (res.error) {
        setFeedback({ error: res.error });
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  isVerifiedMentor: !isAlumni,
                  role: !isAlumni ? "alumni" : "student",
                }
              : u
          )
        );
        setFeedback({ message: res.message });
      }
    });
  };

  const handleDeleteUser = (userId: string, fullName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete the account of ${fullName}? This will purge their profile, posts, and connection history.`
      )
    ) {
      return;
    }

    setFeedback(null);
    setActionLoadingId(userId);

    startTransition(async () => {
      const res = await deleteUserAccountAction(userId);
      setActionLoadingId(null);
      if (res.error) {
        setFeedback({ error: res.error });
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setFeedback({ message: res.message });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="rounded-[24px] border border-border/80 dark:border-slate-800 bg-card p-4 sm:p-5 card-shadow space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Role Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/60 dark:bg-slate-800/80">
            {(["all", "student", "alumni", "admin"] as const).map((role) => (
              <button
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  selectedRole === role
                    ? "bg-card dark:bg-slate-700 text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                key={role}
                onClick={() => setSelectedRole(role)}
                type="button"
              >
                {role === "all" ? "All Users" : `${role}s`}{" "}
                <span className="text-[11px] opacity-70">({counts[role]})</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              className="w-full rounded-xl border border-border/80 dark:border-slate-700 bg-muted/40 dark:bg-slate-800/60 pl-9 pr-3.5 py-2 text-xs sm:text-sm outline-none focus:border-primary focus:bg-card dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, username, email..."
              type="text"
              value={searchTerm}
            />
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`rounded-xl p-3 text-xs font-medium ${
              feedback.error
                ? "border border-destructive/30 bg-destructive/10 text-destructive"
                : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {feedback.error || feedback.message}
          </div>
        )}
      </div>

      {/* Users Data Display */}
      <div className="rounded-[24px] border border-border/80 dark:border-slate-800 bg-card overflow-hidden card-shadow">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-800/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3.5 pl-6 pr-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Academic / Company</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 pl-4 pr-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td className="py-12 text-center text-muted-foreground text-sm" colSpan={5}>
                    No users found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrentAdmin = user.id === currentAdminId;
                  const isLoading = actionLoadingId === user.id;

                  return (
                    <tr className="hover:bg-muted/30 dark:hover:bg-slate-800/30 transition-colors" key={user.id}>
                      {/* Name & Avatar */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              alt={user.fullName}
                              className="size-10 rounded-full object-cover shrink-0"
                              src={user.avatarUrl}
                            />
                          ) : (
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                              {initials(user.fullName)}
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                              <span>{user.fullName}</span>
                              {isCurrentAdmin && (
                                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              @{user.username || "no-username"} · {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                            user.role === "admin"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              : user.role === "alumni"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-primary/10 text-primary dark:text-blue-400 border border-primary/20"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <Shield className="size-3" />
                          ) : user.role === "alumni" ? (
                            <UserCheck className="size-3" />
                          ) : (
                            <GraduationCap className="size-3" />
                          )}
                          <span>{user.role}</span>
                        </span>
                      </td>

                      {/* Academic / Career Info */}
                      <td className="py-4 px-4">
                        {user.role === "student" ? (
                          <div className="space-y-0.5">
                            <p className="text-xs font-medium text-foreground">
                              {user.universityName || "University not set"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {user.departmentName || "Dept not set"}
                              {user.graduationYear ? ` ('${String(user.graduationYear).slice(-2)})` : ""}
                            </p>
                          </div>
                        ) : user.role === "alumni" ? (
                          <div className="space-y-0.5">
                            <p className="text-xs font-medium text-foreground">
                              {user.companyName || "Company not set"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {user.jobTitle || "Alumni Mentor"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">System Administrator</p>
                        )}
                      </td>

                      {/* Active / Inactive Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            user.isActive
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {user.isActive ? (
                            <CheckCircle2 className="size-3" />
                          ) : (
                            <XCircle className="size-3" />
                          )}
                          <span>{user.isActive ? "Active" : "Suspended"}</span>
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 pl-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isLoading ? (
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              {/* Suspend / Activate Toggle */}
                              {!isCurrentAdmin && (
                                <button
                                  className={`rounded-lg p-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                                    user.isActive
                                      ? "text-amber-600 hover:bg-amber-500/10"
                                      : "text-emerald-600 hover:bg-emerald-500/10"
                                  }`}
                                  onClick={() => handleToggleStatus(user.id, user.isActive)}
                                  title={user.isActive ? "Suspend User" : "Activate User"}
                                  type="button"
                                >
                                  {user.isActive ? (
                                    <Ban className="size-4" />
                                  ) : (
                                    <UserCheck className="size-4" />
                                  )}
                                </button>
                              )}

                              {/* Verified Alumni Mentor Badge Toggle */}
                              {!isCurrentAdmin && (
                                <button
                                  className={`rounded-lg p-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                                    user.role === "alumni"
                                      ? "text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20"
                                      : "text-muted-foreground hover:bg-muted"
                                  }`}
                                  onClick={() => handleToggleMentor(user.id, user.role)}
                                  title={
                                    user.role === "alumni"
                                      ? "Verified Alumni Mentor (Click to revoke)"
                                      : "Verify as Alumni Mentor"
                                  }
                                  type="button"
                                >
                                  <UserCheck className="size-4" />
                                </button>
                              )}

                              {/* Role Selector */}
                              {!isCurrentAdmin && (
                                <select
                                  className="rounded-lg border border-border/80 dark:border-slate-700 bg-muted/40 dark:bg-slate-800 px-2 py-1 text-xs text-foreground outline-none cursor-pointer"
                                  onChange={(e) =>
                                    handleRoleChange(
                                      user.id,
                                      e.target.value as "student" | "alumni" | "admin"
                                    )
                                  }
                                  value={user.role}
                                >
                                  <option value="student">Student</option>
                                  <option value="alumni">Alumni</option>
                                  <option value="admin">Admin</option>
                                </select>
                              )}

                              {/* Delete Action */}
                              {!isCurrentAdmin && (
                                <button
                                  className="rounded-lg p-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  onClick={() => handleDeleteUser(user.id, user.fullName)}
                                  title="Delete User Account"
                                  type="button"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Stack View */}
        <div className="md:hidden divide-y divide-border/60 dark:divide-slate-800">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No users found matching your criteria.
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isCurrentAdmin = user.id === currentAdminId;
              const isLoading = actionLoadingId === user.id;

              return (
                <div className="p-4 space-y-3" key={user.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {initials(user.fullName)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">@{user.username || "user"}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        user.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {user.isActive ? "Active" : "Suspended"}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>Role: <span className="font-semibold capitalize text-foreground">{user.role}</span></p>
                    <p>Email: <span className="text-foreground">{user.email}</span></p>
                    {user.universityName && <p>University: {user.universityName}</p>}
                    {user.companyName && <p>Company: {user.companyName}</p>}
                  </div>

                  {!isCurrentAdmin && (
                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <button
                        className="text-xs font-semibold text-amber-600 hover:underline cursor-pointer"
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        type="button"
                      >
                        {user.isActive ? "Suspend" : "Activate"}
                      </button>
                      <button
                        className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                        onClick={() => handleDeleteUser(user.id, user.fullName)}
                        type="button"
                      >
                        Delete User
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
