"use client";

import { AtSign, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";

import {
  signInWithEmail,
  signUpWithEmail,
} from "@/app/login/actions";

type AuthMode = "signin" | "signup";

function PasswordField({
  autoComplete,
  label,
  name,
  placeholder = "••••••••",
}: {
  autoComplete: string;
  label: string;
  name: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-semibold text-foreground" htmlFor={name}>
          {label}
        </label>
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
          <Lock className="size-4" />
        </div>
        <input
          autoComplete={autoComplete}
          className="block w-full pl-10 pr-10 py-3 bg-muted/60 dark:bg-slate-800/80 text-foreground placeholder:text-muted-foreground border border-border/70 dark:border-slate-700 rounded-xl focus:border-primary focus:bg-card dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors text-sm"
          id={name}
          minLength={6}
          name={name}
          placeholder={placeholder}
          required
          type={visible ? "text" : "password"}
        />
        <button
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setVisible((v) => !v)}
          type="button"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
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
    <div className="w-full space-y-6">
      {/* Title */}
      <div className="text-center md:text-left space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {isSignin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {isSignin
            ? "Log in to your Shongjog account."
            : "Sign up to join your university student & alumni network."}
        </p>
      </div>

      {/* Main Email Form */}
      <form
        action={isSignin ? signInWithEmail : signUpWithEmail}
        className="space-y-4"
      >
        {!isSignin ? (
          <>
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-foreground" htmlFor="fullName">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <User className="size-4" />
                </div>
                <input
                  autoComplete="name"
                  className="block w-full pl-10 pr-4 py-3 bg-muted/60 dark:bg-slate-800/80 text-foreground placeholder:text-muted-foreground border border-border/70 dark:border-slate-700 rounded-xl focus:border-primary focus:bg-card dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors text-sm"
                  id="fullName"
                  name="fullName"
                  placeholder="Rahim Ahmed"
                  required
                  type="text"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-foreground" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <AtSign className="size-4" />
                </div>
                <input
                  autoComplete="username"
                  autoCapitalize="none"
                  className="block w-full pl-10 pr-4 py-3 bg-muted/60 dark:bg-slate-800/80 text-foreground placeholder:text-muted-foreground border border-border/70 dark:border-slate-700 rounded-xl focus:border-primary focus:bg-card dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors text-sm"
                  id="username"
                  name="username"
                  pattern="^[a-zA-Z0-9_]{3,30}$"
                  placeholder="rahimahmed"
                  required
                  title="3-30 characters, letters, numbers, and underscores only"
                  type="text"
                />
              </div>
            </div>
          </>
        ) : null}

        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-semibold text-foreground" htmlFor="email">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Mail className="size-4" />
            </div>
            <input
              autoComplete="email"
              className="block w-full pl-10 pr-4 py-3 bg-muted/60 dark:bg-slate-800/80 text-foreground placeholder:text-muted-foreground border border-border/70 dark:border-slate-700 rounded-xl focus:border-primary focus:bg-card dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors text-sm"
              id="email"
              name="email"
              placeholder="you@university.edu.bd"
              required
              type="email"
            />
          </div>
        </div>

        {/* Password */}
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

        {/* Submit Button */}
        <button
          className="w-full flex justify-center py-3 px-4 rounded-full font-semibold text-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          type="submit"
        >
          {isSignin ? "Log In" : "Create Account"}
        </button>
      </form>

      {/* Mode Switch Link */}
      <p className="text-center text-xs sm:text-sm text-muted-foreground pt-2">
        {isSignin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          className="font-bold text-primary hover:underline ml-1 cursor-pointer"
          onClick={() => setMode(isSignin ? "signup" : "signin")}
          type="button"
        >
          {isSignin ? "Sign up" : "Log in"}
        </button>
      </p>
    </div>
  );
}
