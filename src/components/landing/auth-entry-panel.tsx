"use client";

import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";

import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/app/login/actions";

type AuthMode = "signin" | "signup";

function GoogleMark() {
  return (
    <span
      aria-hidden="true"
      className="flex size-5 items-center justify-center rounded-full bg-white text-sm font-bold text-[#1E293B]"
    >
      G
    </span>
  );
}

function PasswordField({
  autoComplete,
  label,
  name,
}: {
  autoComplete: string;
  label: string;
  name: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[#191C1B]">{label}</span>
      <span className="relative block">
        <LockKeyhole
          aria-hidden="true"
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#747875]"
        />
        <input
          autoComplete={autoComplete}
          className="min-h-12 w-full rounded-xl border border-[#BFC9C3] bg-white px-10 text-base outline-none transition placeholder:text-[#747875] focus:border-[#0F5A47] focus:ring-4 focus:ring-[#0F5A47]/15 sm:text-sm"
          minLength={8}
          name={name}
          required
          type={visible ? "text" : "password"}
        />
        <button
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#747875] hover:bg-[#F2F4F1] hover:text-[#0F5A47]"
          onClick={() => setVisible((value) => !value)}
          type="button"
        >
          {visible ? (
            <EyeOff aria-hidden="true" className="size-4" />
          ) : (
            <Eye aria-hidden="true" className="size-4" />
          )}
        </button>
      </span>
    </label>
  );
}

function TextField({
  autoComplete,
  icon,
  label,
  name,
  type = "text",
}: {
  autoComplete: string;
  icon: "mail" | "user";
  label: string;
  name: string;
  type?: "email" | "text";
}) {
  const Icon = icon === "mail" ? Mail : UserRound;

  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[#191C1B]">{label}</span>
      <span className="relative block">
        <Icon
          aria-hidden="true"
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#747875]"
        />
        <input
          autoComplete={autoComplete}
          className="min-h-12 w-full rounded-xl border border-[#BFC9C3] bg-white px-10 text-base outline-none transition placeholder:text-[#747875] focus:border-[#0F5A47] focus:ring-4 focus:ring-[#0F5A47]/15 sm:text-sm"
          name={name}
          required
          type={type}
        />
      </span>
    </label>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-[#BFC9C3]/80" />
      <span className="text-xs font-semibold uppercase tracking-wide text-[#747875]">
        or
      </span>
      <span className="h-px flex-1 bg-[#BFC9C3]/80" />
    </div>
  );
}

export function AuthEntryPanel({
  defaultMode = "signin",
}: {
  defaultMode?: AuthMode;
}) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const isSignin = mode === "signin";

  return (
    <section className="w-full rounded-2xl border border-[#BFC9C3] bg-white p-5 shadow-[0_16px_40px_rgba(30,41,59,0.10)] sm:p-6 lg:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#14B8A6]">
          {isSignin ? "Sign in" : "Create account"}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#191C1B] sm:text-3xl">
          {isSignin ? "Sign in" : "Create your Shongjog account"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#3F4945]">
          {isSignin
            ? "Welcome back to your Shongjog network."
            : "Start with your account, then choose Student or Alumni during onboarding."}
        </p>
      </div>

      <form action={signInWithGoogle} className="mt-6">
        <input name="next" type="hidden" value="/dashboard" />
        <button
          className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#0F5A47] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#0B4939]"
          type="submit"
        >
          <GoogleMark />
          Continue with Google
        </button>
      </form>

      <Divider />

      <form
        action={isSignin ? signInWithEmail : signUpWithEmail}
        className="mt-1 space-y-4"
      >
        {!isSignin ? (
          <TextField
            autoComplete="name"
            icon="user"
            label="Full name"
            name="fullName"
          />
        ) : null}
        <TextField
          autoComplete="email"
          icon="mail"
          label="Email"
          name="email"
          type="email"
        />
        <PasswordField
          autoComplete={isSignin ? "current-password" : "new-password"}
          label="Password"
          name="password"
        />
        {!isSignin ? (
          <PasswordField
            autoComplete="new-password"
            label="Confirm password"
            name="confirmPassword"
          />
        ) : null}
        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#1E293B] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#111827]"
          type="submit"
        >
          {isSignin ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#3F4945]">
        {isSignin ? "New to Shongjog?" : "Already have an account?"}{" "}
        <button
          className="font-bold text-[#0F5A47] underline-offset-4 hover:underline"
          onClick={() => setMode(isSignin ? "signup" : "signin")}
          type="button"
        >
          {isSignin ? "Create account" : "Sign in"}
        </button>
      </p>
    </section>
  );
}
