import "server-only";

import { cache } from "react";

import { createClient, getAuthUserId } from "@/lib/supabase/server";
import type {
  ProfileDetails,
  ProfileExperience,
  ProfileProject,
  ProfileSkill,
  PublicProfile,
  ViewerProfile,
} from "@/lib/profile/types";

export const getAuthenticatedUserId = cache(async () => {
  return getAuthUserId();
});


export const getViewerProfile = cache(async (): Promise<ViewerProfile | null> => {
  const viewerUserId = await getAuthenticatedUserId();

  if (!viewerUserId) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, role, full_name, username, avatar_url")
    .eq("id", viewerUserId)
    .maybeSingle();

  if (!data || data.role === "admin") {
    return null;
  }

  return {
    avatarUrl: data.avatar_url,
    details: {
      role: data.role as "student" | "alumni",
    },
    fullName: data.full_name,
    id: data.id,
    username: data.username,
  };
});

const FULL_PROFILE_SELECT = `
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
    internship_available,
    availability_text,
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
    id,
    title,
    description,
    project_url,
    image_url
  ),
  experiences (
    id,
    company,
    position,
    description,
    start_date,
    end_date,
    is_current
  )
`;

type RelationalProfileData = {
  avatar_url: string | null;
  bio: string | null;
  full_name: string | null;
  id: string;
  role: "student" | "alumni" | "admin";
  username: string | null;
  student_profiles:
    | {
        availability_text: string | null;
        department_id: string | null;
        departments: { name: string } | { name: string }[] | null;
        graduation_year: number | null;
        internship_available: boolean;
        universities: { name: string } | { name: string }[] | null;
        university_id: string | null;
      }
    | {
        availability_text: string | null;
        department_id: string | null;
        departments: { name: string } | { name: string }[] | null;
        graduation_year: number | null;
        internship_available: boolean;
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
  projects:
    | {
        description: string | null;
        id: string;
        image_url: string | null;
        project_url: string | null;
        title: string;
      }[]
    | null;
  experiences:
    | {
        company: string;
        description: string | null;
        end_date: string | null;
        id: string;
        is_current: boolean;
        position: string;
        start_date: string | null;
      }[]
    | null;
};

function extractRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

function parsePublicProfile(
  raw: RelationalProfileData,
  viewerUserId: string | null
): PublicProfile | null {
  if (raw.role === "admin") {
    return null;
  }

  let details: ProfileDetails | null = null;

  if (raw.role === "student") {
    const student = extractRelation(raw.student_profiles);
    const university = extractRelation(student?.universities);
    const department = extractRelation(student?.departments);

    details = {
      availabilityText: student?.availability_text ?? null,
      departmentId: student?.department_id ?? null,
      departmentName: department?.name ?? null,
      graduationYear: student?.graduation_year ?? null,
      internshipAvailable: student?.internship_available ?? false,
      role: "student",
      universityId: student?.university_id ?? null,
      universityName: university?.name ?? null,
    };
  } else if (raw.role === "alumni") {
    const alumni = extractRelation(raw.alumni_profiles);
    const university = extractRelation(alumni?.universities);
    const department = extractRelation(alumni?.departments);

    details = {
      companyName: alumni?.company_name ?? null,
      departmentId: alumni?.department_id ?? null,
      departmentName: department?.name ?? null,
      experienceYears: alumni?.experience_years ?? null,
      graduationYear: alumni?.graduation_year ?? null,
      jobTitle: alumni?.job_title ?? null,
      professionalField: alumni?.professional_field ?? null,
      role: "alumni",
      universityId: alumni?.university_id ?? null,
      universityName: university?.name ?? null,
    };
  } else {
    details = {
      availabilityText: null,
      departmentId: null,
      departmentName: null,
      graduationYear: null,
      internshipAvailable: false,
      role: "student",
      universityId: null,
      universityName: null,
    };
  }

  const skills: ProfileSkill[] = (raw.user_skills ?? [])
    .map((item) => extractRelation(item.skills))
    .filter((skill): skill is ProfileSkill => Boolean(skill))
    .sort((a, b) => a.name.localeCompare(b.name));

  const projects: ProfileProject[] = (raw.projects ?? []).map((project) => ({
    description: project.description,
    id: project.id,
    imageUrl: project.image_url,
    projectUrl: project.project_url,
    title: project.title,
  }));

  const experiences: ProfileExperience[] =
    raw.role === "alumni"
      ? (raw.experiences ?? []).map((exp) => ({
          company: exp.company,
          description: exp.description,
          endDate: exp.end_date,
          id: exp.id,
          isCurrent: exp.is_current,
          position: exp.position,
          startDate: exp.start_date,
        }))
      : [];

  return {
    avatarUrl: raw.avatar_url,
    bio: raw.bio,
    details,
    experiences,
    fullName: raw.full_name,
    id: raw.id,
    isOwner: viewerUserId === raw.id,
    projects,
    skills,
    username: raw.username,
  };
}

export const getOwnProfile = cache(async (): Promise<PublicProfile | null> => {
  const viewerUserId = await getAuthenticatedUserId();

  if (!viewerUserId) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select(FULL_PROFILE_SELECT)
    .eq("id", viewerUserId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return parsePublicProfile(data as unknown as RelationalProfileData, viewerUserId);
});

export const getProfileByUsername = cache(
  async (username: string): Promise<PublicProfile | null> => {
    const viewerUserId = await getAuthenticatedUserId();
    const supabase = await createClient();
    const { data } = await supabase
      .from("users")
      .select(FULL_PROFILE_SELECT)
      .eq("username", username.toLowerCase())
      .maybeSingle();

    if (!data) {
      return null;
    }

    return parsePublicProfile(data as unknown as RelationalProfileData, viewerUserId);
  }
);

export const getProfileById = cache(
  async (userId: string): Promise<PublicProfile | null> => {
    const viewerUserId = await getAuthenticatedUserId();
    const supabase = await createClient();
    const { data } = await supabase
      .from("users")
      .select(FULL_PROFILE_SELECT)
      .eq("id", userId)
      .maybeSingle();

    if (!data) {
      return null;
    }

    return parsePublicProfile(data as unknown as RelationalProfileData, viewerUserId);
  }
);


