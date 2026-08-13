import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getMessagingActor() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Please sign in again.", profile: null, supabase, user: null };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, role, username")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role === "admin") {
    return {
      error: "Complete a student or alumni profile before using messages.",
      profile: null,
      supabase,
      user,
    };
  }

  return { error: null, profile, supabase, user };
}
