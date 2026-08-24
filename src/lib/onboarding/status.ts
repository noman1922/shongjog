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
  let { data: userRecord } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  // If user exists in Auth but missing from public.users, create/sync fallback record
  if (!userRecord && user) {
    const rawRole = user.user_metadata?.role;
    const role = rawRole === "alumni" || rawRole === "admin" ? rawRole : "student";
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Member";
    const username =
      user.user_metadata?.username ||
      user.email?.split("@")[0] ||
      `user_${user.id.slice(0, 8)}`;

    const { data: insertedUser } = await supabase
      .from("users")
      .upsert(
        {
          email: user.email,
          full_name: fullName,
          id: user.id,
          is_active: true,
          role,
          username,
        },
        { onConflict: "id" }
      )
      .select("id, role")
      .maybeSingle();

    userRecord = insertedUser;
  }

  if (!userRecord) {
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
