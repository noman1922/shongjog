import "server-only";

import type { PublicProfile } from "@/lib/profile/types";

export type FeedRankCandidate = {
  author: {
    departmentId: string | null;
    id: string;
    role: "student" | "alumni";
    skillIds: string[];
    universityId: string | null;
  };
  commentCount: number;
  createdAt: string;
  id: string;
  reactionCount: number;
};

export type RankedFeedPost = FeedRankCandidate & {
  rankScore: number;
};

function recencyScore(createdAt: string) {
  const ageHours = Math.max(
    0,
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
  );

  if (ageHours <= 24) {
    return 45;
  }

  if (ageHours <= 72) {
    return 34;
  }

  if (ageHours <= 168) {
    return 24;
  }

  if (ageHours <= 720) {
    return 12;
  }

  return 4;
}

function sharedSkillCount(viewerSkills: Set<string>, authorSkills: string[]) {
  return authorSkills.filter((skillId) => viewerSkills.has(skillId)).length;
}

export function rankFeedPosts({
  candidates,
  connectedUserIds,
  viewerProfile,
}: {
  candidates: FeedRankCandidate[];
  connectedUserIds: Set<string>;
  viewerProfile: PublicProfile;
}): RankedFeedPost[] {
  const viewerSkills = new Set(viewerProfile.skills.map((skill) => skill.id));

  return candidates
    .map((candidate) => {
      let score = recencyScore(candidate.createdAt);

      if (connectedUserIds.has(candidate.author.id)) {
        score += 42;
      }

      if (
        viewerProfile.details.universityId &&
        candidate.author.universityId === viewerProfile.details.universityId
      ) {
        score += 30;
      }

      if (
        viewerProfile.details.departmentId &&
        candidate.author.departmentId === viewerProfile.details.departmentId
      ) {
        score += 16;
      }

      score += Math.min(sharedSkillCount(viewerSkills, candidate.author.skillIds), 4) * 9;

      if (
        viewerProfile.details.role === "student" &&
        candidate.author.role === "alumni"
      ) {
        score += 14;
      }

      score += Math.min(candidate.reactionCount, 20) * 0.8;
      score += Math.min(candidate.commentCount, 20) * 1.2;

      return { ...candidate, rankScore: score };
    })
    .sort((a, b) => {
      if (b.rankScore !== a.rankScore) {
        return b.rankScore - a.rankScore;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}
