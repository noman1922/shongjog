"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const adminSignInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

function adminErrorRedirect(message: string): never {
  const params = new URLSearchParams({
    error: message,
  });

  redirect(`/admin/login?${params.toString()}`);
}

export async function signInAdminWithEmail(formData: FormData) {
  const parsed = adminSignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    adminErrorRedirect(
      parsed.error.issues[0]?.message ?? "Invalid sign-in details."
    );
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (authError || !authData.user) {
    adminErrorRedirect("Invalid admin credentials. Please check your email and password.");
  }

  // Verify that the user has admin role in public.users
  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !userProfile || userProfile.role !== "admin") {
    // Revoke session if not an authorized admin
    await supabase.auth.signOut();
    adminErrorRedirect("Unauthorized. Only administrative accounts can access this portal.");
  }

  redirect("/admin");
}
