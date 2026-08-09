import "server-only";

import { createClient } from "@/lib/supabase/server";

export type UniversityOption = {
  id: string;
  name: string;
  short_name: string | null;
};

export type DepartmentOption = {
  id: string;
  university_id: string;
  name: string;
  short_name: string | null;
};

export type SkillOption = {
  id: string;
  name: string;
};

export async function getOnboardingOptions() {
  const supabase = await createClient();

  const [universities, departments, skills] = await Promise.all([
    supabase
      .from("universities")
      .select("id, name, short_name")
      .order("name", { ascending: true }),
    supabase
      .from("departments")
      .select("id, university_id, name, short_name")
      .order("name", { ascending: true }),
    supabase.from("skills").select("id, name").order("name", { ascending: true }),
  ]);

  return {
    departments: (departments.data ?? []) as DepartmentOption[],
    skills: (skills.data ?? []) as SkillOption[],
    universities: (universities.data ?? []) as UniversityOption[],
    error: universities.error ?? departments.error ?? skills.error,
  };
}
