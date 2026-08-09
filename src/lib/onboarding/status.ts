import "server-only";

import { createClient } from "@/lib/supabase/server";

export type OnboardingStatus = {
  completed: boolean;
  role: "student" | "alumni" | "admin" | null;
};

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { completed: false, role: null };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return { completed: false, role: null };
  }

  if (profile.role === "admin") {
    return { completed: true, role: "admin" };
  }

  const table =
    profile.role === "alumni" ? "alumni_profiles" : "student_profiles";

  const { data: roleProfile } = await supabase
    .from(table)
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    completed: Boolean(roleProfile),
    role: profile.role,
  };
}
