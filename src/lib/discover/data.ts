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

type DbUser = {
  avatar_url: string | null;
  bio: string | null;
  full_name: string | null;
  id: string;
  role: Role;
  username: string | null;
};

type DbAcademicProfile = {
  department_id: string | null;
  graduation_year: number | null;
  university_id: string | null;
  user_id: string;
};

type DbProject = {
  description: string | null;
  id: string;
  image_url: string | null;
  project_url: string | null;
  title: string;
  user_id: string;
};

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
      .select("user_id, university_id, department_id, graduation_year")
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

async function getNames(academicProfiles: Map<string, DbAcademicProfile>) {
  const supabase = await createClient();
  const universityIds = Array.from(
    new Set(
      Array.from(academicProfiles.values())
        .map((profile) => profile.university_id)
        .filter(Boolean) as string[]
    )
  );
  const departmentIds = Array.from(
    new Set(
      Array.from(academicProfiles.values())
        .map((profile) => profile.department_id)
        .filter(Boolean) as string[]
    )
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

async function getSkillNamesByUser(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, string[]>();
  }

  const supabase = await createClient();
  const { data: userSkills } = await supabase
    .from("user_skills")
    .select("user_id, skill_id")
    .in("user_id", userIds);
  const skillIds = Array.from(
    new Set((userSkills ?? []).map((userSkill) => userSkill.skill_id))
  );

  if (skillIds.length === 0) {
    return new Map();
  }

  const { data: skills } = await supabase
    .from("skills")
    .select("id, name")
    .in("id", skillIds);
  const skillNames = new Map(
    ((skills ?? []) as { id: string; name: string }[]).map((skill) => [
      skill.id,
      skill.name,
    ])
  );
  const byUser = new Map<string, string[]>();

  (userSkills ?? []).forEach((userSkill) => {
    const name = skillNames.get(userSkill.skill_id);

    if (name) {
      byUser.set(userSkill.user_id, [...(byUser.get(userSkill.user_id) ?? []), name]);
    }
  });

  return byUser;
}

async function getProjectCounts(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, number>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("user_id")
    .in("user_id", userIds)
    .limit(200);
  const counts = new Map<string, number>();

  (data ?? []).forEach((project) => {
    counts.set(project.user_id, (counts.get(project.user_id) ?? 0) + 1);
  });

  return counts;
}

async function getConnectionStates(
  viewerId: string,
  userIds: string[]
): Promise<Map<string, ProfileConnectionState>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();
  const [outgoing, incoming] = await Promise.all([
    supabase
      .from("connections")
      .select("id, requester_id, receiver_id, status")
      .eq("requester_id", viewerId)
      .in("receiver_id", userIds)
      .in("status", ["pending", "accepted"]),
    supabase
      .from("connections")
      .select("id, requester_id, receiver_id, status")
      .eq("receiver_id", viewerId)
      .in("requester_id", userIds)
      .in("status", ["pending", "accepted"]),
  ]);
  const states = new Map<string, ProfileConnectionState>();

  userIds.forEach((userId) => states.set(userId, { kind: "none" }));
  states.set(viewerId, { kind: "self" });

  [...(outgoing.data ?? []), ...(incoming.data ?? [])].forEach((connection) => {
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

async function getRoleLines(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, string | null>();
  }

  const supabase = await createClient();
  const [students, alumni] = await Promise.all([
    supabase
      .from("student_profiles")
      .select("user_id, graduation_year")
      .in("user_id", userIds),
    supabase
      .from("alumni_profiles")
      .select("user_id, company_name, job_title, professional_field, experience_years")
      .in("user_id", userIds),
  ]);
  const lines = new Map<string, string | null>();

  ((students.data ?? []) as { graduation_year: number | null; user_id: string }[])
    .forEach((profile) =>
      lines.set(
        profile.user_id,
        profile.graduation_year ? `Student • Class of ${profile.graduation_year}` : "Student"
      )
    );
  ((alumni.data ?? []) as {
    company_name: string | null;
    experience_years: number | null;
    job_title: string | null;
    professional_field: string | null;
    user_id: string;
  }[]).forEach((profile) =>
    lines.set(
      profile.user_id,
      [profile.job_title, profile.company_name].filter(Boolean).join(" at ") ||
        profile.professional_field ||
        (profile.experience_years !== null
          ? `${profile.experience_years} years experience`
          : "Alumni")
    )
  );

  return lines;
}

async function getAuthors(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, { fullName: string | null; username: string | null }>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, full_name, username")
    .in("id", Array.from(new Set(userIds)));

  return new Map(
    ((data ?? []) as { full_name: string | null; id: string; username: string | null }[])
      .map((user) => [
        user.id,
        { fullName: user.full_name, username: user.username },
      ])
  );
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
      matchedExperiences,
      matchedAlumniProfiles,
      opportunities,
    ] = await Promise.all([
      supabase
        .from("users")
        .select("id, role, full_name, username, avatar_url, bio")
        .neq("role", "admin")
        .or(buildIlikeOr(["full_name", "username", "bio"], patterns))
        .limit(30),
      supabase
        .from("skills")
        .select("id, name")
        .or(buildIlikeOr(["name"], patterns))
        .limit(20),
      supabase
        .from("projects")
        .select("id, user_id, title, description, project_url, image_url")
        .or(buildIlikeOr(["title", "description"], patterns))
        .limit(10),
      supabase
        .from("experiences")
        .select("user_id")
        .or(buildIlikeOr(["company", "position", "description"], patterns))
        .limit(30),
      supabase
        .from("alumni_profiles")
        .select("user_id")
        .or(
          buildIlikeOr(["company_name", "job_title", "professional_field"], patterns)
        )
        .limit(30),
      supabase
        .from("opportunities")
        .select("id, type, title, company_name, location, deadline")
        .eq("status", "open")
        .or(buildIlikeOr(["title", "company_name", "description"], patterns))
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    ((directUsers.data ?? []) as DbUser[]).forEach((user) =>
      addScore(scores, user.id, 30, "Profile match")
    );

    const skillIds = (matchedSkills.data ?? []).map((skill) => skill.id);
    if (skillIds.length > 0) {
      const { data: userSkills } = await supabase
        .from("user_skills")
        .select("user_id")
        .in("skill_id", skillIds)
        .limit(80);

      (userSkills ?? []).forEach((userSkill) =>
        addScore(scores, userSkill.user_id, 40, "Skill match")
      );
    }

    ((matchedProjects.data ?? []) as DbProject[]).forEach((project) =>
      addScore(scores, project.user_id, 28, "Project match")
    );
    (matchedExperiences.data ?? []).forEach((experience) =>
      addScore(scores, experience.user_id, 26, "Experience match")
    );
    (matchedAlumniProfiles.data ?? []).forEach((profile) =>
      addScore(scores, profile.user_id, 26, "Experience match")
    );

    const userIds = Array.from(scores.keys()).slice(0, 80);
    const projectAuthors = await getAuthors(
      ((matchedProjects.data ?? []) as DbProject[]).map((project) => project.user_id)
    );

    if (userIds.length === 0) {
      return {
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
        people: [],
        projects: ((matchedProjects.data ?? []) as DbProject[]).map((project) => {
          const author = projectAuthors.get(project.user_id);
          return {
            authorName: author?.fullName ?? null,
            authorUsername: author?.username ?? null,
            description: project.description,
            id: project.id,
            projectUrl: project.project_url,
            title: project.title,
          };
        }),
        query,
        research: [],
      };
    }

    const [
      { data: users },
      academicProfiles,
      skillsByUser,
      projectCounts,
      connectionStates,
      roleLines,
    ] = await Promise.all([
      supabase
        .from("users")
        .select("id, role, full_name, username, avatar_url, bio")
        .neq("role", "admin")
        .in("id", userIds),
      getAcademicProfiles(userIds),
      getSkillNamesByUser(userIds),
      getProjectCounts(userIds),
      ownProfile ? getConnectionStates(ownProfile.id, userIds) : Promise.resolve(new Map()),
      getRoleLines(userIds),
    ]);
    const names = await getNames(academicProfiles);

    const people = ((users ?? []) as DbUser[])
      .filter(
        (user): user is DbUser & { role: "student" | "alumni" } =>
          user.role !== "admin"
      )
      .map((user) => {
        const academicProfile = academicProfiles.get(user.id);
        const score = scores.get(user.id) ?? { reasons: new Set<string>(), score: 0 };
        const skills = skillsByUser.get(user.id) ?? [];
        let adjustedScore =
          score.score +
          profileCompletenessScore({
            bio: user.bio,
            hasAcademicProfile: Boolean(academicProfile),
            projectCount: projectCounts.get(user.id) ?? 0,
            skillCount: skills.length,
          });

        if (
          ownProfile?.details.universityId &&
          academicProfile?.university_id === ownProfile.details.universityId
        ) {
          adjustedScore += 12;
          score.reasons.add("Same university");
        }

        if (
          ownProfile?.details.departmentId &&
          academicProfile?.department_id === ownProfile.details.departmentId
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
          departmentName: academicProfile?.department_id
            ? names.departments.get(academicProfile.department_id) ?? null
            : null,
          fullName: user.full_name,
          id: user.id,
          matchReasons: Array.from(score.reasons).slice(0, 4),
          role: user.role,
          roleLine: roleLines.get(user.id) ?? null,
          score: adjustedScore,
          skills: skills.slice(0, 5),
          universityName: academicProfile?.university_id
            ? names.universities.get(academicProfile.university_id) ?? null
            : null,
          username: user.username,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return {
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
      people,
      projects: ((matchedProjects.data ?? []) as DbProject[]).map((project) => {
        const author = projectAuthors.get(project.user_id);
        return {
          authorName: author?.fullName ?? null,
          authorUsername: author?.username ?? null,
          description: project.description,
          id: project.id,
          projectUrl: project.project_url,
          title: project.title,
        };
      }),
      query,
      research: [],
    };
  }
);
