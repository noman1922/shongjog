import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type AdminUserSummary = {
  createdAt: string;
  email: string;
  fullName: string;
  id: string;
  isActive: boolean;
  role: "student" | "alumni" | "admin";
  username: string | null;
};

export type AdminDashboardData = {
  activeRestrictions: number;
  admins: number;
  alumni: number;
  latestUsers: AdminUserSummary[];
  openOpportunities: number;
  pendingReports: number;
  posts: number;
  students: number;
  unreadNotifications: number;
  users: number;
};

export async function getCurrentAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("users")
    .select("id, role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (data?.role !== "admin") {
    return null;
  }

  return {
    email: data.email as string,
    fullName: data.full_name as string,
    id: data.id as string,
  };
}

export const getAdminDashboardData = cache(async (): Promise<AdminDashboardData> => {
  const supabase = await createClient();
  const [
    usersResult,
    studentsResult,
    alumniResult,
    adminsResult,
    postsResult,
    openOpportunitiesResult,
    pendingReportsResult,
    activeRestrictionsResult,
    unreadNotificationsResult,
    latestUsersResult,
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "student"),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "alumni"),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin"),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("user_restrictions")
      .select("id", { count: "exact", head: true })
      .is("ends_at", null),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false),
    supabase
      .from("users")
      .select("id, role, full_name, username, email, is_active, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  return {
    activeRestrictions: activeRestrictionsResult.count ?? 0,
    admins: adminsResult.count ?? 0,
    alumni: alumniResult.count ?? 0,
    latestUsers: ((latestUsersResult.data ?? []) as {
      created_at: string;
      email: string;
      full_name: string;
      id: string;
      is_active: boolean;
      role: "student" | "alumni" | "admin";
      username: string | null;
    }[]).map((user) => ({
      createdAt: user.created_at,
      email: user.email,
      fullName: user.full_name,
      id: user.id,
      isActive: user.is_active,
      role: user.role,
      username: user.username,
    })),
    openOpportunities: openOpportunitiesResult.count ?? 0,
    pendingReports: pendingReportsResult.count ?? 0,
    posts: postsResult.count ?? 0,
    students: studentsResult.count ?? 0,
    unreadNotifications: unreadNotificationsResult.count ?? 0,
    users: usersResult.count ?? 0,
  };
});
