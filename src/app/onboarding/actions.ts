"use server";

import { redirect } from "next/navigation";

import {
  alumniOnboardingSchema,
  studentOnboardingSchema,
  type AlumniOnboardingInput,
  type StudentOnboardingInput,
} from "@/lib/onboarding/schema";
import { createClient } from "@/lib/supabase/server";

type ActionResult = {
  error?: string;
};

function getAuthEmail(user: { email?: string; user_metadata?: Record<string, unknown> }) {
  if (user.email) {
    return user.email;
  }

  const metadataEmail = user.user_metadata?.email;
  return typeof metadataEmail === "string" ? metadataEmail : "";
}

function getAvatarUrl(user: { user_metadata?: Record<string, unknown> }) {
  const avatarUrl = user.user_metadata?.avatar_url ?? user.user_metadata?.picture;
  return typeof avatarUrl === "string" ? avatarUrl : null;
}

async function ensureUsernameAvailable(
  supabase: Awaited<ReturnType<typeof createClient>>,
  username: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .neq("id", userId)
    .maybeSingle();

  if (error) {
    return { available: false, error: "Could not check username availability." };
  }

  if (data) {
    return { available: false, error: "That username is already taken." };
  }

  return { available: true };
}

async function validateAcademicSelection(
  supabase: Awaited<ReturnType<typeof createClient>>,
  universityId: string,
  departmentId: string
) {
  const { data, error } = await supabase
    .from("departments")
    .select("id")
    .eq("id", departmentId)
    .eq("university_id", universityId)
    .maybeSingle();

  if (error || !data) {
    return "Please choose a department from the selected university.";
  }

  return null;
}

async function replaceUserSkills(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  skillIds: string[]
) {
  const uniqueSkillIds = Array.from(new Set(skillIds));

  if (uniqueSkillIds.length === 0) {
    const { error: deleteError } = await supabase
      .from("user_skills")
      .delete()
      .eq("user_id", userId);

    return deleteError ? "Could not update your skills." : null;
  }

  const { data: existingSkills, error: skillsError } = await supabase
    .from("skills")
    .select("id")
    .in("id", uniqueSkillIds);

  if (skillsError || (existingSkills?.length ?? 0) !== uniqueSkillIds.length) {
    return "Please choose only existing skills.";
  }

  const { error: deleteError } = await supabase
    .from("user_skills")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    return "Could not update your skills.";
  }

  const { error: insertError } = await supabase.from("user_skills").insert(
    uniqueSkillIds.map((skillId) => ({
      skill_id: skillId,
      user_id: userId,
    }))
  );

  if (insertError) {
    return "Could not save your skills.";
  }

  return null;
}

async function upsertBaseUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  },
  values: Pick<StudentOnboardingInput, "bio" | "fullName" | "username">,
  role: "student" | "alumni"
) {
  const { error } = await supabase.from("users").upsert(
    {
      avatar_url: getAvatarUrl(user),
      bio: values.bio,
      email: getAuthEmail(user),
      full_name: values.fullName,
      id: user.id,
      role,
      username: values.username,
    },
    { onConflict: "id" }
  );

  if (error?.code === "23505") {
    return "That username is already taken.";
  }

  if (error) {
    return "Could not save your profile.";
  }

  return null;
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Please sign in again.", supabase, user: null };
  }

  return { supabase, user, error: null };
}

export async function submitStudentOnboarding(
  input: StudentOnboardingInput
): Promise<ActionResult> {
  const parsed = studentOnboardingSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profile details." };
  }

  const values = parsed.data;
  const { error, supabase, user } = await getAuthenticatedUser();

  if (error || !user) {
    return { error };
  }

  const username = await ensureUsernameAvailable(supabase, values.username, user.id);
  if (!username.available) {
    return { error: username.error };
  }

  const academicError = await validateAcademicSelection(
    supabase,
    values.universityId,
    values.departmentId
  );
  if (academicError) {
    return { error: academicError };
  }

  const userError = await upsertBaseUser(supabase, user, values, "student");
  if (userError) {
    return { error: userError };
  }

  const skillsError = await replaceUserSkills(supabase, user.id, values.skillIds);
  if (skillsError) {
    return { error: skillsError };
  }

  const { error: profileError } = await supabase.from("student_profiles").upsert(
    {
      availability_text: values.availabilityText || null,
      department_id: values.departmentId,
      graduation_year: values.graduationYear,
      internship_available: values.internshipAvailable,
      university_id: values.universityId,
      user_id: user.id,
    },
    { onConflict: "user_id" }
  );

  if (profileError) {
    return { error: "Could not save your student profile." };
  }

  await supabase.from("alumni_profiles").delete().eq("user_id", user.id);

  redirect("/dashboard");
}

export async function submitAlumniOnboarding(
  input: AlumniOnboardingInput
): Promise<ActionResult> {
  const parsed = alumniOnboardingSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profile details." };
  }

  const values = parsed.data;
  const { error, supabase, user } = await getAuthenticatedUser();

  if (error || !user) {
    return { error };
  }

  const username = await ensureUsernameAvailable(supabase, values.username, user.id);
  if (!username.available) {
    return { error: username.error };
  }

  const academicError = await validateAcademicSelection(
    supabase,
    values.universityId,
    values.departmentId
  );
  if (academicError) {
    return { error: academicError };
  }

  const userError = await upsertBaseUser(supabase, user, values, "alumni");
  if (userError) {
    return { error: userError };
  }

  const skillsError = await replaceUserSkills(supabase, user.id, values.skillIds);
  if (skillsError) {
    return { error: skillsError };
  }

  const { error: profileError } = await supabase.from("alumni_profiles").upsert(
    {
      company_name: values.companyName,
      department_id: values.departmentId,
      experience_years: values.experienceYears,
      graduation_year: values.graduationYear,
      job_title: values.jobTitle,
      professional_field: values.professionalField,
      university_id: values.universityId,
      user_id: user.id,
    },
    { onConflict: "user_id" }
  );

  if (profileError) {
    return { error: "Could not save your alumni profile." };
  }

  await supabase.from("student_profiles").delete().eq("user_id", user.id);

  redirect("/dashboard");
}
