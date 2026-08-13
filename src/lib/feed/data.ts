import "server-only";

import { cache } from "react";

import {
  rankFeedPosts,
  type FeedRankCandidate,
  type RankedFeedPost,
} from "@/lib/feed/ranking";
import type { PublicProfile } from "@/lib/profile/types";
import { createClient } from "@/lib/supabase/server";

const FEED_PAGE_SIZE = 20;
const FEED_CANDIDATE_LIMIT = 60;

type Role = "student" | "alumni" | "admin";

type DbPost = {
  comments?: { count: number }[] | null;
  content: string;
  created_at: string;
  id: string;
  post_reactions?: { count: number }[] | null;
  post_type: string;
  user_id: string;
};

type DbUser = {
  avatar_url: string | null;
  bio: string | null;
  full_name: string | null;
  id: string;
  role: Role;
  username: string | null;
};

type DbAcademicProfile = {
  company_name?: string | null;
  department_id: string | null;
  graduation_year: number | null;
  job_title?: string | null;
  professional_field?: string | null;
  university_id: string | null;
  user_id: string;
};

export type FeedAuthor = {
  avatarUrl: string | null;
  departmentId: string | null;
  departmentName: string | null;
  fullName: string | null;
  id: string;
  role: "student" | "alumni";
  roleLine: string;
  universityId: string | null;
  universityName: string | null;
  username: string | null;
};

export type FeedComment = {
  authorAvatarUrl: string | null;
  authorName: string | null;
  authorUsername: string | null;
  content: string;
  createdAt: string;
  id: string;
};

export type FeedMedia = {
  id: string;
  mediaType: string;
  mediaUrl: string;
};

export type FeedPost = {
  author: FeedAuthor;
  commentCount: number;
  comments: FeedComment[];
  content: string;
  createdAt: string;
  id: string;
  isOwnPost: boolean;
  media: FeedMedia[];
  postType: string;
  rankScore: number;
  reactionCount: number;
  viewerHasLiked: boolean;
};

export type FeedSuggestion = {
  avatarUrl: string | null;
  fullName: string | null;
  id: string;
  role: "student" | "alumni";
  username: string | null;
};

export type FeedOpportunity = {
  companyName: string;
  deadline: string | null;
  id: string;
  location: string | null;
  title: string;
  type: string;
};

export type HomeFeedData = {
  nextCursor: string | null;
  notificationsCount: number;
  opportunities: FeedOpportunity[];
  posts: FeedPost[];
  suggestions: FeedSuggestion[];
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function isFeedUser(user: DbUser | null | undefined): user is DbUser & {
  role: "student" | "alumni";
} {
  return Boolean(user && user.role !== "admin");
}

function relationCount(value: { count: number }[] | null | undefined) {
  return value?.[0]?.count ?? 0;
}

async function getAuthors(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, DbUser>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, role, full_name, username, avatar_url, bio")
    .neq("role", "admin")
    .in("id", unique(userIds));

  return new Map(((data ?? []) as DbUser[]).map((user) => [user.id, user]));
}

async function getAcademicProfiles(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, DbAcademicProfile>();
  }

  const supabase = await createClient();
  const [students, alumni] = await Promise.all([
    supabase
      .from("student_profiles")
      .select("user_id, university_id, department_id, graduation_year")
      .in("user_id", userIds),
    supabase
      .from("alumni_profiles")
      .select(
        "user_id, university_id, department_id, graduation_year, company_name, job_title, professional_field"
      )
      .in("user_id", userIds),
  ]);
  const profiles = new Map<string, DbAcademicProfile>();

  ((students.data ?? []) as DbAcademicProfile[]).forEach((profile) =>
    profiles.set(profile.user_id, profile)
  );
  ((alumni.data ?? []) as DbAcademicProfile[]).forEach((profile) =>
    profiles.set(profile.user_id, profile)
  );

  return profiles;
}

async function getAcademicNames(academicProfiles: Map<string, DbAcademicProfile>) {
  const supabase = await createClient();
  const universityIds = unique(
    Array.from(academicProfiles.values())
      .map((profile) => profile.university_id)
      .filter(Boolean) as string[]
  );
  const departmentIds = unique(
    Array.from(academicProfiles.values())
      .map((profile) => profile.department_id)
      .filter(Boolean) as string[]
  );
  const [universities, departments] = await Promise.all([
    universityIds.length
      ? supabase.from("universities").select("id, name").in("id", universityIds)
      : Promise.resolve({ data: [] }),
    departmentIds.length
      ? supabase.from("departments").select("id, name").in("id", departmentIds)
      : Promise.resolve({ data: [] }),
  ]);

  return {
    departments: new Map(
      ((departments.data ?? []) as { id: string; name: string }[]).map((item) => [
        item.id,
        item.name,
      ])
    ),
    universities: new Map(
      ((universities.data ?? []) as { id: string; name: string }[]).map((item) => [
        item.id,
        item.name,
      ])
    ),
  };
}

async function getSkillIdsByUser(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, string[]>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("user_skills")
    .select("user_id, skill_id")
    .in("user_id", userIds);
  const byUser = new Map<string, string[]>();

  (data ?? []).forEach((skill) => {
    byUser.set(skill.user_id, [...(byUser.get(skill.user_id) ?? []), skill.skill_id]);
  });

  return byUser;
}

async function getAcceptedConnectionUserIds(viewerUserId: string, authorIds: string[]) {
  if (authorIds.length === 0) {
    return new Set<string>();
  }

  const supabase = await createClient();
  const ids = unique(authorIds);
  const [outgoing, incoming] = await Promise.all([
    supabase
      .from("connections")
      .select("receiver_id")
      .eq("requester_id", viewerUserId)
      .eq("status", "accepted")
      .in("receiver_id", ids),
    supabase
      .from("connections")
      .select("requester_id")
      .eq("receiver_id", viewerUserId)
      .eq("status", "accepted")
      .in("requester_id", ids),
  ]);

  return new Set([
    ...(outgoing.data ?? []).map((connection) => connection.receiver_id),
    ...(incoming.data ?? []).map((connection) => connection.requester_id),
  ]);
}

async function getPostMedia(postIds: string[]) {
  if (postIds.length === 0) {
    return new Map<string, FeedMedia[]>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("post_media")
    .select("id, post_id, media_url, media_type, sort_order")
    .in("post_id", postIds)
    .order("sort_order", { ascending: true })
    .limit(postIds.length * 4);
  const media = new Map<string, FeedMedia[]>();

  ((data ?? []) as {
    id: string;
    media_type: string;
    media_url: string;
    post_id: string;
  }[]).forEach((item) => {
    media.set(item.post_id, [
      ...(media.get(item.post_id) ?? []),
      { id: item.id, mediaType: item.media_type, mediaUrl: item.media_url },
    ]);
  });

  return media;
}

async function getRecentComments(postIds: string[]) {
  if (postIds.length === 0) {
    return new Map<string, FeedComment[]>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select("id, post_id, user_id, content, created_at")
    .is("deleted_at", null)
    .in("post_id", postIds)
    .order("created_at", { ascending: false })
    .limit(postIds.length * 3);
  const rawComments = (data ?? []) as {
    content: string;
    created_at: string;
    id: string;
    post_id: string;
    user_id: string;
  }[];
  const authors = await getAuthors(rawComments.map((comment) => comment.user_id));
  const comments = new Map<string, FeedComment[]>();

  rawComments.forEach((comment) => {
    const current = comments.get(comment.post_id) ?? [];

    if (current.length >= 3) {
      return;
    }

    const author = authors.get(comment.user_id);
    comments.set(comment.post_id, [
      ...current,
      {
        authorAvatarUrl: author?.avatar_url ?? null,
        authorName: author?.full_name ?? null,
        authorUsername: author?.username ?? null,
        content: comment.content,
        createdAt: comment.created_at,
        id: comment.id,
      },
    ]);
  });

  return comments;
}

async function getSidebarData(viewerUserId: string, role: "student" | "alumni") {
  const supabase = await createClient();
  const [notifications, suggestions, opportunities] = await Promise.all([
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", viewerUserId)
      .eq("is_read", false),
    supabase
      .from("users")
      .select("id, role, full_name, username, avatar_url")
      .neq("id", viewerUserId)
      .eq("role", role === "student" ? "alumni" : "student")
      .limit(5),
    supabase
      .from("opportunities")
      .select("id, type, title, company_name, location, deadline")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  return {
    notificationsCount: notifications.count ?? 0,
    opportunities: ((opportunities.data ?? []) as {
      company_name: string;
      deadline: string | null;
      id: string;
      location: string | null;
      title: string;
      type: string;
    }[]).map((opportunity) => ({
      companyName: opportunity.company_name,
      deadline: opportunity.deadline,
      id: opportunity.id,
      location: opportunity.location,
      title: opportunity.title,
      type: opportunity.type,
    })),
    suggestions: ((suggestions.data ?? []) as DbUser[])
      .filter(
        (suggestion): suggestion is DbUser & { role: "student" | "alumni" } =>
          suggestion.role !== "admin"
      )
      .map((suggestion) => ({
        avatarUrl: suggestion.avatar_url,
        fullName: suggestion.full_name,
        id: suggestion.id,
        role: suggestion.role,
        username: suggestion.username,
      })),
  };
}

function roleLine(user: DbUser, academicProfile: DbAcademicProfile | undefined) {
  if (user.role === "student") {
    return academicProfile?.graduation_year
      ? `Student - Class of ${academicProfile.graduation_year}`
      : "Student";
  }

  return (
    [academicProfile?.job_title, academicProfile?.company_name]
      .filter(Boolean)
      .join(" at ") || "Alumni"
  );
}

function toRankCandidate({
  academicProfile,
  post,
  reactionCounts,
  commentCounts,
  skillIdsByUser,
  user,
}: {
  academicProfile: DbAcademicProfile | undefined;
  commentCounts: Map<string, number>;
  post: DbPost;
  reactionCounts: Map<string, number>;
  skillIdsByUser: Map<string, string[]>;
  user: DbUser & { role: "student" | "alumni" };
}): FeedRankCandidate {
  return {
    author: {
      departmentId: academicProfile?.department_id ?? null,
      id: user.id,
      role: user.role,
      skillIds: skillIdsByUser.get(user.id) ?? [],
      universityId: academicProfile?.university_id ?? null,
    },
    commentCount: commentCounts.get(post.id) ?? 0,
    createdAt: post.created_at,
    id: post.id,
    reactionCount: reactionCounts.get(post.id) ?? 0,
  };
}

export const getHomeFeedData = cache(
  async ({
    cursor,
    profile,
    userId,
  }: {
    cursor?: string | null;
    profile: PublicProfile;
    userId: string;
  }): Promise<HomeFeedData> => {
    const supabase = await createClient();
    let postsQuery = supabase
      .from("posts")
      .select(
        "id, user_id, content, post_type, created_at, comments(count), post_reactions(count)"
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(FEED_CANDIDATE_LIMIT);

    if (cursor) {
      postsQuery = postsQuery.lt("created_at", cursor);
    }

    const [postsResult, sidebarData] = await Promise.all([
      postsQuery,
      getSidebarData(userId, profile.details.role),
    ]);
    const rawPosts = (postsResult.data ?? []) as DbPost[];

    if (rawPosts.length === 0) {
      return {
        nextCursor: null,
        notificationsCount: sidebarData.notificationsCount,
        opportunities: sidebarData.opportunities,
        posts: [],
        suggestions: sidebarData.suggestions,
      };
    }

    const postIds = rawPosts.map((post) => post.id);
    const authorIds = unique(rawPosts.map((post) => post.user_id));
    const [authors, academicProfiles, skillIdsByUser, connectedUserIds, viewerReactions] =
      await Promise.all([
        getAuthors(authorIds),
        getAcademicProfiles(authorIds),
        getSkillIdsByUser(authorIds),
        getAcceptedConnectionUserIds(userId, authorIds),
        supabase
          .from("post_reactions")
          .select("post_id")
          .eq("user_id", userId)
          .in("post_id", postIds)
          .limit(FEED_CANDIDATE_LIMIT),
      ]);
    const reactionCounts = new Map(
      rawPosts.map((post) => [post.id, relationCount(post.post_reactions)])
    );
    const commentCounts = new Map(
      rawPosts.map((post) => [post.id, relationCount(post.comments)])
    );
    const viewerReactionIds = new Set(
      ((viewerReactions.data ?? []) as { post_id: string }[]).map(
        (reaction) => reaction.post_id
      )
    );

    const candidates = rawPosts
      .map((post) => {
        const user = authors.get(post.user_id);

        if (!isFeedUser(user)) {
          return null;
        }

        return toRankCandidate({
          academicProfile: academicProfiles.get(user.id),
          commentCounts,
          post,
          reactionCounts,
          skillIdsByUser,
          user,
        });
      })
      .filter(Boolean) as FeedRankCandidate[];
    const ranked = rankFeedPosts({
      candidates,
      connectedUserIds,
      viewerProfile: profile,
    }).slice(0, FEED_PAGE_SIZE);
    const selectedPostIds = ranked.map((post) => post.id);
    const [mediaByPost, commentsByPost, academicNames] = await Promise.all([
      getPostMedia(selectedPostIds),
      getRecentComments(selectedPostIds),
      getAcademicNames(academicProfiles),
    ]);
    const postById = new Map(rawPosts.map((post) => [post.id, post]));

    return {
      nextCursor:
        rawPosts.length === FEED_CANDIDATE_LIMIT
          ? rawPosts[rawPosts.length - 1]?.created_at ?? null
          : null,
      notificationsCount: sidebarData.notificationsCount,
      opportunities: sidebarData.opportunities,
      posts: ranked
        .map((rankedPost: RankedFeedPost) => {
          const post = postById.get(rankedPost.id);
          const user = post ? authors.get(post.user_id) : null;
          const academicProfile = user ? academicProfiles.get(user.id) : undefined;

          if (!post || !isFeedUser(user)) {
            return null;
          }

          return {
            author: {
              avatarUrl: user.avatar_url,
              departmentId: academicProfile?.department_id ?? null,
              departmentName: academicProfile?.department_id
                ? academicNames.departments.get(academicProfile.department_id) ?? null
                : null,
              fullName: user.full_name,
              id: user.id,
              role: user.role,
              roleLine: roleLine(user, academicProfile),
              universityId: academicProfile?.university_id ?? null,
              universityName: academicProfile?.university_id
                ? academicNames.universities.get(academicProfile.university_id) ?? null
                : null,
              username: user.username,
            },
            commentCount: rankedPost.commentCount,
            comments: commentsByPost.get(post.id) ?? [],
            content: post.content,
            createdAt: post.created_at,
            id: post.id,
            isOwnPost: post.user_id === userId,
            media: mediaByPost.get(post.id) ?? [],
            postType: post.post_type,
            rankScore: rankedPost.rankScore,
            reactionCount: rankedPost.reactionCount,
            viewerHasLiked: viewerReactionIds.has(post.id),
          };
        })
        .filter(Boolean) as FeedPost[],
      suggestions: sidebarData.suggestions,
    };
  }
);
