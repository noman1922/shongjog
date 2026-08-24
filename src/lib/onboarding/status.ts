import "server-only";

import { cache } from "react";

import { createClient, getAuthUser } from "@/lib/supabase/server";

export type OnboardingStatus = {
  completed: boolean;
  isOnboarded: boolean;
  role: "student" | "alumni" | "admin" | null;
};

export const getOnboardingStatus = cache(async (): Promise<OnboardingStatus> => {
  const user = await getAuthUser();

  if (!user) {
    return { completed: false, isOnboarded: false, role: null };
  }

  const supabase = await createClient();

  // 1. Fetch user base record
  const { data: userRecord, error: userError } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (userError || !userRecord) {
    return { completed: false, isOnboarded: false, role: null };
  }

  // 2. Admin Bypass: If admin, immediately return completed without querying student/alumni profiles
  if (userRecord.role === "admin") {
    return { completed: true, isOnboarded: true, role: "admin" };
  }

  // 3. For student / alumni, check respective profile tables
  if (userRecord.role === "student") {
    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    const isComplete = Boolean(studentProfile);
    return {
      completed: isComplete,
      isOnboarded: isComplete,
      role: "student",
    };
  }

  if (userRecord.role === "alumni") {
    const { data: alumniProfile } = await supabase
      .from("alumni_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    const isComplete = Boolean(alumniProfile);
    return {
      completed: isComplete,
      isOnboarded: isComplete,
      role: "alumni",
    };
  }

  return { completed: false, isOnboarded: false, role: null };
});
