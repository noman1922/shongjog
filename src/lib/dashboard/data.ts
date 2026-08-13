import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type DashboardPost = {
  authorName: string | null;
  authorRole: "student" | "alumni" | "admin" | null;
  authorUsername: string | null;
  content: string;
  createdAt: string;
  id: string;
  type: string;
};

export type DashboardOpportunity = {
  companyName: string;
  deadline: string | null;
  description: string | null;
  employmentType: string | null;
  id: string;
  location: string | null;
  title: string;
  type: string;
};

export type DashboardSuggestion = {
  avatarUrl: string | null;
  fullName: string | null;
  id: string;
  role: "student" | "alumni" | "admin";
  username: string | null;
};

type DbSuggestion = {
  avatar_url: string | null;
  full_name: string | null;
  id: string;
  role: "student" | "alumni" | "admin";
  username: string | null;
};

export type DashboardData = {
  notificationsCount: number;
  opportunities: DashboardOpportunity[];
  posts: DashboardPost[];
  suggestions: DashboardSuggestion[];
};

async function getPostAuthors(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, DashboardSuggestion>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, role, full_name, username, avatar_url")
    .in("id", Array.from(new Set(userIds)));

  return new Map(
    ((data ?? []) as DbSuggestion[]).map((user) => [
      user.id,
      {
        avatarUrl: user.avatar_url,
        fullName: user.full_name,
        id: user.id,
        role: user.role,
        username: user.username,
      },
    ])
  );
}

export const getDashboardData = cache(
  async (
    userId: string,
    role: "student" | "alumni" | "admin"
  ): Promise<DashboardData> => {
    const supabase = await createClient();
    const [notifications, postsResult, opportunitiesResult, suggestionsResult] =
      await Promise.all([
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_read", false),
        supabase
          .from("posts")
          .select("id, user_id, content, post_type, created_at")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("opportunities")
          .select(
            "id, type, title, company_name, description, location, employment_type, deadline"
          )
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("users")
          .select("id, role, full_name, username, avatar_url")
          .neq("id", userId)
          .eq("role", role === "student" ? "alumni" : "student")
          .limit(4),
      ]);

    const rawPosts = (postsResult.data ?? []) as {
      content: string;
      created_at: string;
      id: string;
      post_type: string;
      user_id: string;
    }[];
    const authors = await getPostAuthors(rawPosts.map((post) => post.user_id));

    return {
      notificationsCount: notifications.count ?? 0,
      opportunities: ((opportunitiesResult.data ?? []) as {
        company_name: string;
        deadline: string | null;
        description: string | null;
        employment_type: string | null;
        id: string;
        location: string | null;
        title: string;
        type: string;
      }[]).map((opportunity) => ({
        companyName: opportunity.company_name,
        deadline: opportunity.deadline,
        description: opportunity.description,
        employmentType: opportunity.employment_type,
        id: opportunity.id,
        location: opportunity.location,
        title: opportunity.title,
        type: opportunity.type,
      })),
      posts: rawPosts.map((post) => {
        const author = authors.get(post.user_id);
        return {
          authorName: author?.fullName ?? null,
          authorRole: author?.role ?? null,
          authorUsername: author?.username ?? null,
          content: post.content,
          createdAt: post.created_at,
          id: post.id,
          type: post.post_type,
        };
      }),
      suggestions: ((suggestionsResult.data ?? []) as DbSuggestion[])
        .filter((suggestion) => suggestion.role !== "admin")
        .map((suggestion) => ({
          avatarUrl: suggestion.avatar_url,
          fullName: suggestion.full_name,
          id: suggestion.id,
          role: suggestion.role,
          username: suggestion.username,
        })),
    };
  }
);
