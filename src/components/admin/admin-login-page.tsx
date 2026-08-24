import { LockKeyhole, Mail, ShieldAlert, ShieldCheck } from "lucide-react";

import { signInAdminWithEmail } from "@/app/admin/login/actions";
import { ShongjogBrand } from "@/components/shongjog/brand";
import { Button } from "@/components/ui/button";

export function AdminLoginPage({ error }: { error?: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center overflow-x-hidden bg-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8">
      <section className="relative w-full max-w-md overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-8">
        <ShieldCheck
          aria-hidden="true"
          className="absolute right-5 top-5 size-16 text-blue-500/10"
        />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <ShongjogBrand href="/admin/login" inverted variant="admin" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">Administrative Console</h1>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">
            Restricted area. Sign in with your authorized Shongjog admin credentials.
          </p>
        </div>

        {error ? (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <form action={signInAdminWithEmail} className="relative z-10 mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300" htmlFor="admin-email">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="size-4" />
              </div>
              <input
                autoComplete="email"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-800 text-white placeholder:text-slate-500 border border-slate-700 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                id="admin-email"
                name="email"
                placeholder="admin@shongjog.edu"
                required
                type="email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300" htmlFor="admin-password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LockKeyhole className="size-4" />
              </div>
              <input
                autoComplete="current-password"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-800 text-white placeholder:text-slate-500 border border-slate-700 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                id="admin-password"
                minLength={8}
                name="password"
                placeholder="••••••••"
                required
                type="password"
              />
            </div>
          </div>

          <Button
            className="h-11 w-full bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
            size="lg"
            type="submit"
          >
            <LockKeyhole aria-hidden="true" className="size-4" />
            <span>Sign In to Admin Console</span>
          </Button>
        </form>

        <div className="mt-6 border-t border-slate-700 pt-4">
          <p className="flex items-center justify-center gap-2 text-center text-xs leading-5 text-slate-500">
            <ShieldAlert aria-hidden="true" className="size-4" />
            Unauthorized access attempts are rejected by server-side role checks.
          </p>
        </div>
      </section>
    </main>
  );
}

