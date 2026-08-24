import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthenticatedAdmin = {
  id: string;
  email: string;
  fullName: string;
  role: "admin";
};

export async function requireAdminUser(): Promise<AuthenticatedAdmin> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return {
    email: profile.email as string,
    fullName: profile.full_name as string,
    id: profile.id as string,
    role: "admin",
  };
}
