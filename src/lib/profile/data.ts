import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type {
  ProfileDetails,
  ProfileExperience,
  ProfileProject,
  ProfileSkill,
  PublicProfile,
} from "@/lib/profile/types";

type DbProfileUser = {
  avatar_url: string | null;
  bio: string | null;
  full_name: string | null;
  id: string;
  role: "student" | "alumni" | "admin";
  username: string | null;
};

export async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

async function getAcademicNames(
  universityId: string | null,
  departmentId: string | null
) {
  const supabase = await createClient();
  const [university, department] = await Promise.all([
    universityId
      ? supabase
          .from("universities")
          .select("name")
          .eq("id", universityId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    departmentId
      ? supabase
          .from("departments")
          .select("name")
          .eq("id", departmentId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    departmentName: department.data?.name ?? null,
    universityName: university.data?.name ?? null,
  };
}

async function getProfileDetails(
  userId: string,
  role: "student" | "alumni"
): Promise<ProfileDetails | null> {
  const supabase = await createClient();

  if (role === "student") {
    const { data } = await supabase
      .from("student_profiles")
      .select(
        "university_id, department_id, graduation_year, internship_available, availability_text"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (!data) {
      return null;
    }

    const names = await getAcademicNames(data.university_id, data.department_id);

    return {
      availabilityText: data.availability_text,
      departmentId: data.department_id,
      departmentName: names.departmentName,
      graduationYear: data.graduation_year,
      internshipAvailable: data.internship_available,
      role,
      universityId: data.university_id,
      universityName: names.universityName,
    };
  }

  const { data } = await supabase
    .from("alumni_profiles")
    .select(
      "university_id, department_id, graduation_year, company_name, job_title, professional_field, experience_years"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const names = await getAcademicNames(data.university_id, data.department_id);

  return {
    companyName: data.company_name,
    departmentId: data.department_id,
    departmentName: names.departmentName,
    experienceYears: data.experience_years,
    graduationYear: data.graduation_year,
    jobTitle: data.job_title,
    professionalField: data.professional_field,
    role,
    universityId: data.university_id,
    universityName: names.universityName,
  };
}

async function getProfileSkills(userId: string): Promise<ProfileSkill[]> {
  const supabase = await createClient();
  const { data: userSkills } = await supabase
    .from("user_skills")
    .select("skill_id")
    .eq("user_id", userId);
  const skillIds = (userSkills ?? []).map((skill) => skill.skill_id);

  if (skillIds.length === 0) {
    return [];
  }

  const { data: skills } = await supabase
    .from("skills")
    .select("id, name")
    .in("id", skillIds)
    .order("name", { ascending: true });

  return (skills ?? []) as ProfileSkill[];
}

async function getProjects(userId: string): Promise<ProfileProject[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, title, description, project_url, image_url")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  return (data ?? []).map((project) => ({
    description: project.description,
    id: project.id,
    imageUrl: project.image_url,
    projectUrl: project.project_url,
    title: project.title,
  }));
}

async function getExperiences(userId: string): Promise<ProfileExperience[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("experiences")
    .select("id, company, position, description, start_date, end_date, is_current")
    .eq("user_id", userId)
    .order("start_date", { ascending: false, nullsFirst: false });

  return (data ?? []).map((experience) => ({
    company: experience.company,
    description: experience.description,
    endDate: experience.end_date,
    id: experience.id,
    isCurrent: experience.is_current,
    position: experience.position,
    startDate: experience.start_date,
  }));
}

async function composeProfile(
  profileUser: DbProfileUser,
  viewerUserId: string | null
): Promise<PublicProfile | null> {
  if (profileUser.role === "admin") {
    return null;
  }

  const details = await getProfileDetails(profileUser.id, profileUser.role);

  if (!details) {
    return null;
  }

  const [skills, projects, experiences] = await Promise.all([
    getProfileSkills(profileUser.id),
    getProjects(profileUser.id),
    profileUser.role === "alumni"
      ? getExperiences(profileUser.id)
      : Promise.resolve([]),
  ]);

  return {
    avatarUrl: profileUser.avatar_url,
    bio: profileUser.bio,
    details,
    experiences,
    fullName: profileUser.full_name,
    id: profileUser.id,
    isOwner: viewerUserId === profileUser.id,
    projects,
    skills,
    username: profileUser.username,
  };
}

export const getOwnProfile = cache(async () => {
  const supabase = await createClient();
  const viewerUserId = await getAuthenticatedUserId();

  if (!viewerUserId) {
    return null;
  }

  const { data } = await supabase
    .from("users")
    .select("id, role, full_name, username, avatar_url, bio")
    .eq("id", viewerUserId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return composeProfile(data as DbProfileUser, viewerUserId);
});

export const getProfileByUsername = cache(async (username: string) => {
  const supabase = await createClient();
  const viewerUserId = await getAuthenticatedUserId();
  const { data } = await supabase
    .from("users")
    .select("id, role, full_name, username, avatar_url, bio")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (!data) {
    return null;
  }

  return composeProfile(data as DbProfileUser, viewerUserId);
});
