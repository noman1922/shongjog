import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { getInitials } from "@/lib/utils";

export interface StoryRecord {
  badge: string;
  badgeColor: string;
  date: string;
  discussionQuery?: string;
  gradient: string;
  id: string;
  imageUrl?: string;
  isInstitutionEvent?: boolean;
  location: string;
  organizer: string;
  organizerAvatarUrl?: string | null;
  organizerRole?: string;
  subtitle: string;
  summary: string;
  tags: string[];
  title: string;
  userId?: string;
}

function formatStoryTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return "Active 24h";
  } catch {
    return "Active 24h";
  }
}

export const getActiveDbStories = cache(
  async (
    viewerUserId?: string,
    viewerUniversityId?: string | null
  ): Promise<StoryRecord[]> => {
    try {
      const supabase = await createClient();
      const nowIso = new Date().toISOString();

      // 1. Fetch unexpired active stories
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("id, user_id, media_url, headline, category, description, created_at, expires_at")
        .gt("expires_at", nowIso)
        .order("created_at", { ascending: false })
        .limit(50);

      if (storiesError || !storiesData || storiesData.length === 0) {
        return [];
      }

      // 2. Fetch author user details, academic affiliations, and accepted connections
      const authorIds = Array.from(new Set(storiesData.map((s) => s.user_id).filter(Boolean)));

      const [usersResult, studentProfilesResult, alumniProfilesResult, outgoingConns, incomingConns] =
        await Promise.all([
          supabase
            .from("users")
            .select("id, full_name, username, avatar_url, role")
            .in("id", authorIds),
          supabase
            .from("student_profiles")
            .select("user_id, university_id")
            .in("user_id", authorIds),
          supabase
            .from("alumni_profiles")
            .select("user_id, university_id")
            .in("user_id", authorIds),
          viewerUserId
            ? supabase
                .from("connections")
                .select("receiver_id")
                .eq("requester_id", viewerUserId)
                .eq("status", "accepted")
            : Promise.resolve({ data: [] }),
          viewerUserId
            ? supabase
                .from("connections")
                .select("requester_id")
                .eq("receiver_id", viewerUserId)
                .eq("status", "accepted")
            : Promise.resolve({ data: [] }),
        ]);

      const userMap = new Map<
        string,
        {
          avatar_url: string | null;
          full_name: string | null;
          id: string;
          role: string;
          username: string | null;
        }
      >();
      usersResult.data?.forEach((u) => userMap.set(u.id, u));

      const universityMap = new Map<string, string>();
      studentProfilesResult.data?.forEach((p) => {
        if (p.university_id) universityMap.set(p.user_id, p.university_id);
      });
      alumniProfilesResult.data?.forEach((p) => {
        if (p.university_id) universityMap.set(p.user_id, p.university_id);
      });

      const connectedUserIds = new Set<string>();
      (outgoingConns?.data ?? []).forEach((c: { receiver_id: string }) =>
        connectedUserIds.add(c.receiver_id)
      );
      (incomingConns?.data ?? []).forEach((c: { requester_id: string }) =>
        connectedUserIds.add(c.requester_id)
      );

      // 3. Sort stories with connection and university relevance:
      // Prioritize:
      // (1) Stories by the user themselves
      // (2) Stories by connected friends (accepted status)
      // (3) Stories by same university peers
      // (4) Other community stories by recency
      const sortedStories = [...storiesData].sort((a, b) => {
        if (!viewerUserId) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }

        const aIsSelf = a.user_id === viewerUserId ? 1 : 0;
        const bIsSelf = b.user_id === viewerUserId ? 1 : 0;
        if (aIsSelf !== bIsSelf) return bIsSelf - aIsSelf;

        const aIsFriend = connectedUserIds.has(a.user_id) ? 1 : 0;
        const bIsFriend = connectedUserIds.has(b.user_id) ? 1 : 0;
        if (aIsFriend !== bIsFriend) return bIsFriend - aIsFriend;

        const aIsSameUni =
          viewerUniversityId && universityMap.get(a.user_id) === viewerUniversityId ? 1 : 0;
        const bIsSameUni =
          viewerUniversityId && universityMap.get(b.user_id) === viewerUniversityId ? 1 : 0;
        if (aIsSameUni !== bIsSameUni) return bIsSameUni - aIsSameUni;

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      return sortedStories.map((item) => {
        const user = userMap.get(item.user_id);
        const fullName = user?.full_name || user?.username || "Campus Member";
        const initials = getInitials(fullName);
        const roleText = user?.role === "student" ? "Student" : "Alumni Mentor";

        return {
          badge: initials || "ST",
          badgeColor: "bg-primary",
          date: formatStoryTimeAgo(item.created_at || nowIso),
          discussionQuery: item.category || "Campus",
          gradient: "from-primary/90 via-blue-900 to-indigo-950",
          id: item.id,
          imageUrl: item.media_url,
          isInstitutionEvent: false,
          location: "Campus Network",
          organizer: fullName,
          organizerAvatarUrl: user?.avatar_url || null,
          organizerRole: roleText,
          subtitle: item.category || "Campus Story",
          summary: item.description || item.headline,
          tags: [item.category || "Campus Story", "24h Update"],
          title: item.headline,
          userId: item.user_id,
        };
      });
    } catch (err) {
      console.error("Error fetching active stories:", err);
      return [];
    }
  }
);
