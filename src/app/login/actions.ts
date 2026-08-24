"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { type Provider } from "@supabase/supabase-js";
import { z } from "zod";

import { getOnboardingStatus } from "@/lib/onboarding/status";
import { createClient } from "@/lib/supabase/server";

async function getRequestOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin) {
    return origin;
  }

  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") || "http";
  if (host) {
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

const emailSignInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .transform((v) => v.toLowerCase()),
  password: z.string().min(1, "Password is required."),
});

const emailSignUpSchema = z
  .object({
    confirmPassword: z.string(),
    email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .transform((v) => v.toLowerCase()),
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(150, "Full name must be 150 characters or less."),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .max(72, "Password must be 72 characters or less."),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters.")
      .max(30, "Username must be 30 characters or less.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores."
      )
      .transform((v) => v.toLowerCase()),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

function authErrorRedirect(error: string): never {
  redirect(`/?error=${encodeURIComponent(error)}`);
}

function friendlyAuthError(message: string) {
  const lower = message.toLowerCase();

  if (
    lower.includes("email not confirmed") ||
    lower.includes("email_not_confirmed")
  ) {
    return "Please confirm your email address before signing in. Check your inbox for the confirmation link.";
  }

  if (
    lower.includes("rate limit") ||
    lower.includes("over_email_send_rate_limit") ||
    lower.includes("too many requests")
  ) {
    return "Too many attempts or email rate limit reached. Please wait a few minutes before trying again.";
  }

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid_credentials")
  ) {
    return "Invalid email or password.";
  }

  if (
    lower.includes("user already registered") ||
    lower.includes("already exists")
  ) {
    return "An account already exists for this email. Please log in instead.";
  }

  if (
    lower.includes("invalid email") ||
    lower.includes("email_address_invalid")
  ) {
    return "Please enter a valid email address.";
  }

  if (lower.includes("weak_password") || lower.includes("password")) {
    return message;
  }

  return message || "Authentication failed. Please try again.";
}

export async function signInWithEmail(formData: FormData) {
  const parsed = emailSignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    authErrorRedirect(
      parsed.error.issues[0]?.message ?? "Invalid sign-in details."
    );
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !authData.user) {
    authErrorRedirect(friendlyAuthError(error?.message ?? "Authentication failed."));
  }

  // Check user role from public.users and ensure record exists
  let { data: userProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (!userProfile) {
    const rawRole = authData.user.user_metadata?.role;
    const role = rawRole === "alumni" || rawRole === "admin" ? rawRole : "student";
    const fullName =
      authData.user.user_metadata?.full_name ||
      authData.user.user_metadata?.name ||
      authData.user.email?.split("@")[0] ||
      "Member";
    const username =
      authData.user.user_metadata?.username ||
      authData.user.email?.split("@")[0] ||
      `user_${authData.user.id.slice(0, 8)}`;

    const { data: insertedUser } = await supabase
      .from("users")
      .upsert(
        {
          email: authData.user.email,
          full_name: fullName,
          id: authData.user.id,
          is_active: true,
          role,
          username,
        },
        { onConflict: "id" }
      )
      .select("role")
      .maybeSingle();

    userProfile = insertedUser;
  }

  // Block admin users from logging in via standard user login
  if (userProfile?.role === "admin") {
    await supabase.auth.signOut();
    authErrorRedirect(
      "Admin accounts must sign in via the dedicated admin portal at /admin/login."
    );
  }

  const status = await getOnboardingStatus();
  if (!status.completed) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}

export async function signUpWithEmail(formData: FormData) {
  const parsed = emailSignUpSchema.safeParse({
    confirmPassword: formData.get("confirmPassword"),
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    password: formData.get("password"),
    username: formData.get("username"),
  });

  if (!parsed.success) {
    authErrorRedirect(
      parsed.error.issues[0]?.message ?? "Invalid signup details."
    );
  }

  const supabase = await createClient();

  // Check if username or email is already taken in public.users
  try {
    const { data: existingUser } = await supabase
      .from("users")
      .select("username, email")
      .or(`username.eq.${parsed.data.username},email.eq.${parsed.data.email}`)
      .maybeSingle();

    if (existingUser) {
      if (existingUser.email?.toLowerCase() === parsed.data.email) {
        authErrorRedirect(
          "An account already exists for this email. Please log in instead."
        );
      }
      if (existingUser.username?.toLowerCase() === parsed.data.username) {
        authErrorRedirect(
          "That username is already taken. Please choose another username."
        );
      }
    }
  } catch {
    // If public read is restricted, Supabase Auth handles uniqueness
  }

  // Register in Supabase Auth (passwords are managed exclusively by Supabase Auth)
  const origin = await getRequestOrigin();
  const emailRedirectTo = `${origin}/auth/callback?next=/onboarding`;

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        role: "student",
        username: parsed.data.username,
      },
      emailRedirectTo,
    },
  });

  if (error) {
    authErrorRedirect(friendlyAuthError(error.message));
  }

  if (data.user?.identities && data.user.identities.length === 0) {
    authErrorRedirect(
      "An account already exists for this email. Please log in instead."
    );
  }

  const authUserId = data.user?.id;

  // If session was not immediately returned, attempt password sign in
  let sessionActive = Boolean(data.session);
  if (!sessionActive) {
    const signInResult = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (signInResult.data?.session) {
      sessionActive = true;
    }
  }

  // Create or sync the matching public.users record
  if (authUserId) {
    await supabase.from("users").upsert(
      {
        email: parsed.data.email,
        full_name: parsed.data.fullName,
        id: authUserId,
        is_active: true,
        role: "student",
        username: parsed.data.username,
      },
      { onConflict: "id" }
    );
  }

  if (!sessionActive) {
    redirect("/?signup=check_email");
  }

  redirect("/onboarding");
}

export async function signInWithOAuth(
  provider: Provider,
  next = "/dashboard"
) {
  const origin = await getRequestOrigin();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
    provider,
  });

  if (error) {
    authErrorRedirect(friendlyAuthError(error.message));
  }

  if (data?.url) {
    redirect(data.url);
  }
}
