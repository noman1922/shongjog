import "server-only";

import { cache } from "react";

import type { ProfileConnectionState } from "@/lib/connections/types";
import {
  addScore,
  profileCompletenessScore,
  type PersonScore,
} from "@/lib/discover/ranking";
import { buildIlikeOr, getSearchTerms } from "@/lib/discover/search";
import { getOwnProfile } from "@/lib/profile/data";
import { createClient } from "@/lib/supabase/server";

type Role = "student" | "alumni" | "admin";

export type DiscoverPerson = {
  avatarUrl: string | null;
  bio: string | null;
  connectionState: ProfileConnectionState;
  departmentName: string | null;
  fullName: string | null;
  id: string;
  matchReasons: string[];
  role: Exclude<Role, "admin">;
  roleLine: string | null;
  score: number;
  skills: string[];
  universityName: string | null;
  username: string | null;
};

export type DiscoverProject = {
  authorName: string | null;
  authorUsername: string | null;
  description: string | null;
  id: string;
  projectUrl: string | null;
  title: string;
};

export type DiscoverOpportunity = {
  companyName: string;
  deadline: string | null;
  id: string;
  location: string | null;
  title: string;
  type: string;
};

export type DiscoverResults = {
  opportunities: DiscoverOpportunity[];
  people: DiscoverPerson[];
  projects: DiscoverProject[];
  query: string;
  research: [];
};

const RELATIONAL_DISCOVER_USER_SELECT = `
  id,
  role,
  full_name,
  username,
  avatar_url,
  bio,
  student_profiles (
    university_id,
    department_id,
    graduation_year,
    universities (name),
    departments (name)
  ),
  alumni_profiles (
    university_id,
    department_id,
    graduation_year,
    company_name,
    job_title,
    professional_field,
    experience_years,
    universities (name),
    departments (name)
  ),
  user_skills (
    skills (id, name)
  ),
  projects (
    id
  )
`;

type DiscoverRelationalUser = {
  avatar_url: string | null;
  bio: string | null;
  full_name: string | null;
  id: string;
  role: Role;
  username: string | null;
  student_profiles:
    | {
        department_id: string | null;
        departments: { name: string } | { name: string }[] | null;
        graduation_year: number | null;
        universities: { name: string } | { name: string }[] | null;
        university_id: string | null;
      }
    | {
        department_id: string | null;
        departments: { name: string } | { name: string }[] | null;
        graduation_year: number | null;
        universities: { name: string } | { name: string }[] | null;
        university_id: string | null;
      }[]
    | null;
  alumni_profiles:
    | {
        company_name: string | null;
        department_id: string | null;
        departments: { name: string } | { name: string }[] | null;
        experience_years: number | null;
        graduation_year: number | null;
        job_title: string | null;
        professional_field: string | null;
        universities: { name: string } | { name: string }[] | null;
        university_id: string | null;
      }
    | {
        company_name: string | null;
        department_id: string | null;
        departments: { name: string } | { name: string }[] | null;
        experience_years: number | null;
        graduation_year: number | null;
        job_title: string | null;
        professional_field: string | null;
        universities: { name: string } | { name: string }[] | null;
        university_id: string | null;
      }[]
    | null;
  user_skills:
    | {
        skills: { id: string; name: string } | { id: string; name: string }[] | null;
      }[]
    | null;
  projects: { id: string }[] | null;
};

function extractRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? value[0] ?? null : value;
}

async function getConnectionStates(
  viewerId: string,
  userIds: string[]
): Promise<Map<string, ProfileConnectionState>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("connections")
    .select("id, requester_id, receiver_id, status")
    .or(`requester_id.eq.${viewerId},receiver_id.eq.${viewerId}`)
    .in("status", ["pending", "accepted"]);

  const states = new Map<string, ProfileConnectionState>();
  userIds.forEach((userId) => states.set(userId, { kind: "none" }));
  states.set(viewerId, { kind: "self" });

  (data ?? []).forEach((connection) => {
    const otherId =
      connection.requester_id === viewerId
        ? connection.receiver_id
        : connection.requester_id;

    if (!userIds.includes(otherId)) {
      return;
    }

    if (connection.status === "accepted") {
      states.set(otherId, {
        connectionId: connection.id,
        kind: "connected",
      });
    } else if (connection.receiver_id === viewerId) {
      states.set(otherId, {
        connectionId: connection.id,
        kind: "incoming_pending",
      });
    } else {
      states.set(otherId, {
        connectionId: connection.id,
        kind: "outgoing_pending",
      });
    }
  });

  return states;
}

export const searchDiscover = cache(
  async (rawQuery: string): Promise<DiscoverResults> => {
    const { patterns, query } = getSearchTerms(rawQuery);

    if (query.length < 2 || patterns.length === 0) {
      return { opportunities: [], people: [], projects: [], query, research: [] };
    }

    const supabase = await createClient();
    const ownProfile = await getOwnProfile();
    const scores = new Map<string, PersonScore>();

    const [
      directUsers,
      matchedSkills,
      matchedProjects,
      opportunities,
    ] = await Promise.all([
      supabase
        .from("users")
        .select(RELATIONAL_DISCOVER_USER_SELECT)
        .neq("role", "admin")
        .or(buildIlikeOr(["full_name", "username", "bio"], patterns))
        .limit(30),
      supabase
        .from("skills")
        .select("id, name")
        .or(buildIlikeOr(["name"], patterns))
        .limit(15),
      supabase
        .from("projects")
        .select(
          "id, user_id, title, description, project_url, image_url, users(id, full_name, username)"
        )
        .or(buildIlikeOr(["title", "description"], patterns))
        .limit(10),
      supabase
        .from("opportunities")
        .select("id, type, title, company_name, location, deadline")
        .eq("status", "open")
        .or(buildIlikeOr(["title", "company_name", "description"], patterns))
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const userMap = new Map<string, DiscoverRelationalUser>();

    ((directUsers.data ?? []) as unknown as DiscoverRelationalUser[]).forEach(
      (user) => {
        userMap.set(user.id, user);
        addScore(scores, user.id, 30, "Profile match");
      }
    );

    const skillIds = (matchedSkills.data ?? []).map((skill) => skill.id);
    if (skillIds.length > 0) {
      const { data: userSkills } = await supabase
        .from("user_skills")
        .select("user_id")
        .in("skill_id", skillIds)
        .limit(50);

      (userSkills ?? []).forEach((userSkill) =>
        addScore(scores, userSkill.user_id, 40, "Skill match")
      );
    }

    type ProjectWithAuthor = {
      description: string | null;
      id: string;
      image_url: string | null;
      project_url: string | null;
      title: string;
      user_id: string;
      users:
        | { full_name: string | null; id: string; username: string | null }
        | { full_name: string | null; id: string; username: string | null }[]
        | null;
    };

    const projectList = (matchedProjects.data ?? []) as unknown as ProjectWithAuthor[];
    projectList.forEach((project) => {
      addScore(scores, project.user_id, 28, "Project match");
    });

    const allUserIds = Array.from(scores.keys()).slice(0, 50);
    const missingUserIds = allUserIds.filter((id) => !userMap.has(id));

    if (missingUserIds.length > 0) {
      const { data: hydratedUsers } = await supabase
        .from("users")
        .select(RELATIONAL_DISCOVER_USER_SELECT)
        .neq("role", "admin")
        .in("id", missingUserIds);

      ((hydratedUsers ?? []) as unknown as DiscoverRelationalUser[]).forEach(
        (user) => {
          userMap.set(user.id, user);
        }
      );
    }

    const candidateUsers = Array.from(userMap.values()).filter(
      (user): user is DiscoverRelationalUser & { role: "student" | "alumni" } =>
        user.role !== "admin"
    );

    const connectionStates = ownProfile
      ? await getConnectionStates(
          ownProfile.id,
          candidateUsers.map((u) => u.id)
        )
      : new Map<string, ProfileConnectionState>();

    const people: DiscoverPerson[] = candidateUsers
      .map((user) => {
        const isStudent = user.role === "student";
        const student = isStudent
          ? extractRelation(user.student_profiles)
          : null;
        const alumni = !isStudent
          ? extractRelation(user.alumni_profiles)
          : null;

        const university = isStudent
          ? extractRelation(student?.universities)
          : extractRelation(alumni?.universities);
        const department = isStudent
          ? extractRelation(student?.departments)
          : extractRelation(alumni?.departments);

        const universityId = isStudent
          ? student?.university_id ?? null
          : alumni?.university_id ?? null;
        const departmentId = isStudent
          ? student?.department_id ?? null
          : alumni?.department_id ?? null;

        const universityName = university?.name ?? null;
        const departmentName = department?.name ?? null;

        let roleLine: string | null = null;
        if (isStudent) {
          roleLine = student?.graduation_year
            ? `Student • Class of ${student.graduation_year}`
            : "Student";
        } else if (alumni) {
          roleLine =
            [alumni.job_title, alumni.company_name].filter(Boolean).join(" at ") ||
            alumni.professional_field ||
            (alumni.experience_years !== null && alumni.experience_years !== undefined
              ? `${alumni.experience_years} years experience`
              : "Alumni");
        }

        const skills = (user.user_skills ?? [])
          .map((us) => extractRelation(us.skills)?.name)
          .filter((name): name is string => Boolean(name));

        const projectCount = (user.projects ?? []).length;
        const score = scores.get(user.id) ?? {
          reasons: new Set(),
          score: 0,
        };

        let adjustedScore =
          score.score +
          profileCompletenessScore({
            bio: user.bio,
            hasAcademicProfile: Boolean(student || alumni),
            projectCount,
            skillCount: skills.length,
          });

        if (
          ownProfile?.details.universityId &&
          universityId === ownProfile.details.universityId
        ) {
          adjustedScore += 12;
          score.reasons.add("Same university");
        }

        if (
          ownProfile?.details.departmentId &&
          departmentId === ownProfile.details.departmentId
        ) {
          adjustedScore += 8;
          score.reasons.add("Same department");
        }

        if (ownProfile?.details.role === "alumni" && user.role === "student") {
          adjustedScore += 7;
          score.reasons.add("Student relevance");
        }

        return {
          avatarUrl: user.avatar_url,
          bio: user.bio,
          connectionState: connectionStates.get(user.id) ?? { kind: "none" },
          departmentName,
          fullName: user.full_name,
          id: user.id,
          matchReasons: Array.from(score.reasons).slice(0, 4),
          role: user.role,
          roleLine,
          score: adjustedScore,
          skills: skills.slice(0, 5),
          universityName,
          username: user.username,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const formattedProjects: DiscoverProject[] = projectList.map((project) => {
      const author = extractRelation(project.users);
      return {
        authorName: author?.full_name ?? null,
        authorUsername: author?.username ?? null,
        description: project.description,
        id: project.id,
        projectUrl: project.project_url,
        title: project.title,
      };
    });

    const formattedOpportunities: DiscoverOpportunity[] = (
      (opportunities.data ?? []) as {
        company_name: string;
        deadline: string | null;
        id: string;
        location: string | null;
        title: string;
        type: string;
      }[]
    ).map((opportunity) => ({
      companyName: opportunity.company_name,
      deadline: opportunity.deadline,
      id: opportunity.id,
      location: opportunity.location,
      title: opportunity.title,
      type: opportunity.type,
    }));

    return {
      opportunities: formattedOpportunities,
      people,
      projects: formattedProjects,
      query,
      research: [],
    };
  }
);

export type SuggestedConnectionPerson = {
  avatarUrl: string | null;
  departmentName: string | null;
  fullName: string | null;
  id: string;
  matchBadge: string;
  role: "student" | "alumni";
  roleLine: string | null;
  score: number;
  skills: string[];
  universityName: string | null;
  username: string | null;
};

export const getSuggestedConnections = cache(
  async (limit = 9): Promise<SuggestedConnectionPerson[]> => {
    const supabase = await createClient();
    const ownProfile = await getOwnProfile();

    if (!ownProfile) {
      return [];
    }

    const viewerId = ownProfile.id;

    // Fetch existing connections (accepted or pending) to exclude
    const { data: existingConnections } = await supabase
      .from("connections")
      .select("requester_id, receiver_id, status")
      .or(`requester_id.eq.${viewerId},receiver_id.eq.${viewerId}`)
      .in("status", ["pending", "accepted"]);

    const excludedUserIds = new Set<string>([viewerId]);
    (existingConnections ?? []).forEach((c) => {
      excludedUserIds.add(c.requester_id);
      excludedUserIds.add(c.receiver_id);
    });

    // Fetch candidates
    const { data: rawUsers } = await supabase
      .from("users")
      .select(RELATIONAL_DISCOVER_USER_SELECT)
      .neq("role", "admin")
      .limit(30);

    const candidates: SuggestedConnectionPerson[] = ((rawUsers ?? []) as DiscoverRelationalUser[])
      .filter((user) => !excludedUserIds.has(user.id) && user.role !== "admin")
      .map((user) => {
        const student = extractRelation(user.student_profiles);
        const alumni = extractRelation(user.alumni_profiles);
        const universityId = student?.university_id || alumni?.university_id || null;
        const departmentId = student?.department_id || alumni?.department_id || null;
        const universityName =
          extractRelation(student?.universities)?.name ??
          extractRelation(alumni?.universities)?.name ??
          null;
        const departmentName =
          extractRelation(student?.departments)?.name ??
          extractRelation(alumni?.departments)?.name ??
          null;

        let roleLine: string | null = null;
        if (student) {
          roleLine = student.graduation_year
            ? `Student · Class of ${student.graduation_year}`
            : "Student";
        } else if (alumni) {
          roleLine =
            [alumni.job_title, alumni.company_name].filter(Boolean).join(" at ") ||
            alumni.professional_field ||
            "Alumni";
        }

        const skills = (user.user_skills ?? [])
          .map((us) => extractRelation(us.skills)?.name)
          .filter((name): name is string => Boolean(name));

        // Calculate relevance
        let score = 0;
        let matchBadge: string | null = null;

        if (ownProfile.details.universityId && universityId === ownProfile.details.universityId) {
          score += 25;
          matchBadge = "Same University";
        }
        if (ownProfile.details.departmentId && departmentId === ownProfile.details.departmentId) {
          score += 15;
          if (!matchBadge) matchBadge = "Same Department";
        }

        const viewerSkillNames = new Set(ownProfile.skills.map((s) => s.name.toLowerCase()));
        const sharedSkills = skills.filter((s) => viewerSkillNames.has(s.toLowerCase()));
        if (sharedSkills.length > 0) {
          score += sharedSkills.length * 10;
          if (!matchBadge) matchBadge = `${sharedSkills.length} Shared Skill${sharedSkills.length > 1 ? "s" : ""}`;
        }

        if (ownProfile.details.role === "student" && user.role === "alumni") {
          score += 10;
          if (!matchBadge) matchBadge = "Alumni Mentor";
        } else if (ownProfile.details.role === "alumni" && user.role === "student") {
          score += 10;
          if (!matchBadge) matchBadge = "University Student";
        }

        return {
          avatarUrl: user.avatar_url,
          departmentName,
          fullName: user.full_name,
          id: user.id,
          matchBadge: matchBadge ?? "Recommended",
          role: user.role as "student" | "alumni",
          roleLine,
          score,
          skills: skills.slice(0, 3),
          universityName,
          username: user.username,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return candidates;
  }
);

