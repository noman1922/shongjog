import {
  AlertTriangle,
  Bell,
  BriefcaseBusiness,
  FileWarning,
  ShieldCheck,
  Users,
} from "lucide-react";

import { signOutAction } from "@/app/profile/actions";
import { ShongjogBrand } from "@/components/shongjog/brand";
import { Button } from "@/components/ui/button";
import type { AdminDashboardData } from "@/lib/admin/data";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-xl shadow-slate-950/20">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <Icon aria-hidden="true" className="size-5 text-blue-400" />
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    </section>
  );
}

export function AdminDashboard({
  adminName,
  data,
}: {
  adminName: string;
  data: AdminDashboardData;
}) {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ShongjogBrand compact />
            <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-200">
              Admin
            </span>
          </div>
          <form action={signOutAction}>
            <Button
              className="h-11 w-full border-slate-700 text-slate-100 hover:bg-slate-900 sm:w-auto"
              type="submit"
              variant="outline"
            >
              Logout
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1280px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">
                Administrator portal
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                Welcome back, {adminName}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                Monitor Shongjog members, reports, opportunities, restrictions,
                posts, and unread notifications from existing Supabase data.
              </p>
            </div>
            <div className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 text-sm font-semibold text-emerald-200">
              <ShieldCheck aria-hidden="true" className="size-4" />
              Server-side admin verified
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Total users" value={data.users} />
          <StatCard icon={Users} label="Students" value={data.students} />
          <StatCard icon={Users} label="Alumni" value={data.alumni} />
          <StatCard icon={BriefcaseBusiness} label="Open opportunities" value={data.openOpportunities} />
          <StatCard icon={FileWarning} label="Pending reports" value={data.pendingReports} />
          <StatCard icon={AlertTriangle} label="Active restrictions" value={data.activeRestrictions} />
          <StatCard icon={Bell} label="Unread notifications" value={data.unreadNotifications} />
          <StatCard icon={ShieldCheck} label="Admins" value={data.admins} />
        </div>

        <section className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-xl shadow-slate-950/20">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-white">Newest members</h2>
            <span className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-400">
              Live database
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.latestUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-white">{user.fullName}</p>
                      <p className="text-xs text-slate-500">
                        @{user.username ?? "profile"}
                      </p>
                    </td>
                    <td className="py-3 pr-4 capitalize text-slate-300">
                      {user.role}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{user.email}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          user.isActive
                            ? "rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-200"
                            : "rounded-full bg-red-400/10 px-2 py-1 text-xs font-semibold text-red-200"
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

