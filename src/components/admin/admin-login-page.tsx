import { LockKeyhole, ShieldAlert, ShieldCheck } from "lucide-react";

import { signInWithGoogle } from "@/app/login/actions";
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
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-blue-400">
            <LockKeyhole aria-hidden="true" className="size-7" />
          </div>
          <h1 className="text-3xl font-bold text-white">System Admin</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Restricted area. Sign in with your authorized Shongjog admin Google
            account.
          </p>
        </div>

        {error ? (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <form action={signInWithGoogle} className="relative z-10 mt-6">
          <input name="next" type="hidden" value="/admin" />
          <Button
            className="h-12 w-full bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
            size="lg"
            type="submit"
          >
            <LockKeyhole aria-hidden="true" />
            Authenticate with Google
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

