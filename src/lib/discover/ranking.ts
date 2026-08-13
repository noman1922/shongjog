import "server-only";

export type RankReason =
  | "Experience match"
  | "Profile match"
  | "Project match"
  | "Same department"
  | "Same university"
  | "Skill match"
  | "Student relevance";

export type PersonScore = {
  reasons: Set<RankReason>;
  score: number;
};

export function addScore(
  scores: Map<string, PersonScore>,
  userId: string,
  points: number,
  reason: RankReason
) {
  const current = scores.get(userId) ?? { reasons: new Set<RankReason>(), score: 0 };
  current.score += points;
  current.reasons.add(reason);
  scores.set(userId, current);
}

export function profileCompletenessScore({
  bio,
  hasAcademicProfile,
  projectCount,
  skillCount,
}: {
  bio: string | null;
  hasAcademicProfile: boolean;
  projectCount: number;
  skillCount: number;
}) {
  let score = 0;

  if (bio) score += 2;
  if (hasAcademicProfile) score += 3;
  score += Math.min(skillCount, 5);
  score += Math.min(projectCount, 3);

  return score;
}

