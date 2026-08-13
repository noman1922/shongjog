"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const emailSignInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or less."),
});

const emailSignUpSchema = z
  .object({
    email: z.string().trim().email("Enter a valid email address."),
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(150, "Full name must be 150 characters or less."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password must be 72 characters or less."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

function getSafeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export async function signInWithGoogle(formData: FormData) {
  const nextPath = getSafeNextPath(formData.get("next"));
  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  if (!origin) {
    redirect("/?error=missing_origin");
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error || !data.url) {
    redirect("/?error=oauth_start_failed");
  }

  redirect(data.url);
}

function authErrorRedirect(error: string): never {
  redirect(`/?error=${encodeURIComponent(error)}`);
}

function friendlyAuthError(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }

  if (lower.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }

  if (lower.includes("user already registered") || lower.includes("already exists")) {
    return "An account already exists for this email. Please sign in instead.";
  }

  return "Authentication failed. Please try again.";
}

export async function signInWithEmail(formData: FormData) {
  const parsed = emailSignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    authErrorRedirect(parsed.error.issues[0]?.message ?? "Invalid sign-in details.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    authErrorRedirect(friendlyAuthError(error.message));
  }

  redirect("/dashboard");
}

export async function signUpWithEmail(formData: FormData) {
  const parsed = emailSignUpSchema.safeParse({
    confirmPassword: formData.get("confirmPassword"),
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    authErrorRedirect(parsed.error.issues[0]?.message ?? "Invalid signup details.");
  }

  const supabase = await createClient();
  const existingProfile = await supabase
    .from("users")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (existingProfile.data) {
    authErrorRedirect("A Shongjog account already exists for this email.");
  }

  const origin = (await headers()).get("origin");
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: origin
      ? {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
            "/onboarding"
          )}`,
          data: {
            full_name: parsed.data.fullName,
            name: parsed.data.fullName,
          },
        }
      : {
          data: {
            full_name: parsed.data.fullName,
            name: parsed.data.fullName,
          },
        },
  });

  if (error) {
    authErrorRedirect(friendlyAuthError(error.message));
  }

  if (data.user?.identities?.length === 0) {
    authErrorRedirect("A Supabase auth account already exists for this email.");
  }

  if (data.session) {
    redirect("/onboarding");
  }

  redirect("/?signup=check_email");
}
