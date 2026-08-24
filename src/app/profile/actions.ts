"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  experienceSchema,
  profileEditSchema,
  projectSchema,
  uuidSchema,
} from "@/lib/profile/schema";
import { createClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
  success?: string;
};

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function formNumber(formData: FormData, key: string) {
  const value = Number(formString(formData, key));
  return Number.isFinite(value) ? value : Number.NaN;
}

function optionalFormNumber(formData: FormData, key: string) {
  const value = formString(formData, key);

  if (!value) {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : Number.NaN;
}

async function getOwnedProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Please sign in again.", profile: null, supabase, user: null };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, role, username")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role === "admin") {
    return { error: "Complete your profile before editing.", profile: null, supabase, user };
  }

  return { error: null, profile, supabase, user };
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
    return "Could not check username availability.";
  }

  return data ? "That username is already taken." : null;
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

  if (uniqueSkillIds.length > 0) {
    const { data: existingSkills, error: skillsError } = await supabase
      .from("skills")
      .select("id")
      .in("id", uniqueSkillIds);

    if (skillsError || (existingSkills?.length ?? 0) !== uniqueSkillIds.length) {
      return "Please choose only existing skills.";
    }
  }

  const { error: deleteError } = await supabase
    .from("user_skills")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    return "Could not update your skills.";
  }

  if (uniqueSkillIds.length === 0) {
    return null;
  }

  const { error: insertError } = await supabase.from("user_skills").insert(
    uniqueSkillIds.map((skillId) => ({
      skill_id: skillId,
      user_id: userId,
    }))
  );

  return insertError ? "Could not save your skills." : null;
}

function refreshProfilePages(username: string | null) {
  revalidatePath("/profile");
  revalidatePath("/profile/edit");

  if (username) {
    revalidatePath(`/profile/${username}`);
  }
}

export async function updateProfileAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = profileEditSchema.safeParse({
    availabilityText: formString(formData, "availabilityText"),
    bio: formString(formData, "bio"),
    companyName: formString(formData, "companyName"),
    departmentId: formString(formData, "departmentId"),
    experienceYears: optionalFormNumber(formData, "experienceYears"),
    fullName: formString(formData, "fullName"),
    graduationYear: formNumber(formData, "graduationYear"),
    internshipAvailable: formData.get("internshipAvailable") === "on",
    jobTitle: formString(formData, "jobTitle"),
    professionalField: formString(formData, "professionalField"),
    skillIds: formData.getAll("skillIds"),
    universityId: formString(formData, "universityId"),
    username: formString(formData, "username"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profile details." };
  }

  const values = parsed.data;
  const { error, profile, supabase, user } = await getOwnedProfile();

  if (error || !profile || !user) {
    return { error };
  }

  const usernameError = await ensureUsernameAvailable(
    supabase,
    values.username,
    user.id
  );
  if (usernameError) {
    return { error: usernameError };
  }

  const academicError = await validateAcademicSelection(
    supabase,
    values.universityId,
    values.departmentId
  );
  if (academicError) {
    return { error: academicError };
  }

  const { error: userError } = await supabase
    .from("users")
    .update({
      bio: values.bio,
      full_name: values.fullName,
      username: values.username,
    })
    .eq("id", user.id);

  if (userError?.code === "23505") {
    return { error: "That username is already taken." };
  }

  if (userError) {
    return { error: "Could not update your profile." };
  }

  if (profile.role === "student") {
    const { error: studentError } = await supabase
      .from("student_profiles")
      .update({
        availability_text: values.availabilityText || null,
        department_id: values.departmentId,
        graduation_year: values.graduationYear,
        internship_available: values.internshipAvailable ?? false,
        university_id: values.universityId,
      })
      .eq("user_id", user.id);

    if (studentError) {
      return { error: "Could not update your student details." };
    }
  } else if (profile.role === "alumni") {
    const alumniFields = [
      values.companyName,
      values.jobTitle,
      values.professionalField,
    ];

    if (alumniFields.some((value) => !value || value.length < 2)) {
      return { error: "Company, job title, and professional field are required." };
    }

    const { error: alumniError } = await supabase
      .from("alumni_profiles")
      .update({
        company_name: values.companyName,
        department_id: values.departmentId,
        experience_years: values.experienceYears ?? 0,
        graduation_year: values.graduationYear,
        job_title: values.jobTitle,
        professional_field: values.professionalField,
        university_id: values.universityId,
      })
      .eq("user_id", user.id);

    if (alumniError) {
      return { error: "Could not update your alumni details." };
    }
  }

  const skillsError = await replaceUserSkills(supabase, user.id, values.skillIds);
  if (skillsError) {
    return { error: skillsError };
  }

  refreshProfilePages(profile.username);
  refreshProfilePages(values.username);

  return { success: "Profile updated." };
}

export async function saveProjectAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const projectId = formString(formData, "projectId");
  const parsed = projectSchema.safeParse({
    description: formString(formData, "description"),
    imageUrl: formString(formData, "imageUrl"),
    projectId: projectId || undefined,
    projectUrl: formString(formData, "projectUrl"),
    title: formString(formData, "title"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid project details." };
  }

  const values = parsed.data;
  const { error, profile, supabase, user } = await getOwnedProfile();

  if (error || !profile || !user) {
    return { error };
  }

  if (values.projectId) {
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        description: values.description || null,
        image_url: values.imageUrl || null,
        project_url: values.projectUrl || null,
        title: values.title,
      })
      .eq("id", values.projectId)
      .eq("user_id", user.id);

    if (updateError) {
      return { error: "Could not update project." };
    }
  } else {
    const { error: insertError } = await supabase.from("projects").insert({
      description: values.description || null,
      image_url: values.imageUrl || null,
      project_url: values.projectUrl || null,
      title: values.title,
      user_id: user.id,
    });

    if (insertError) {
      return { error: "Could not add project." };
    }
  }

  refreshProfilePages(profile.username);
  return { success: values.projectId ? "Project updated." : "Project added." };
}

export async function deleteProjectAction(formData: FormData) {
  const parsed = uuidSchema.safeParse(formString(formData, "projectId"));
  const { error, profile, supabase, user } = await getOwnedProfile();

  if (!parsed.success || error || !profile || !user) {
    redirect("/profile/edit");
  }

  await supabase
    .from("projects")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id);

  refreshProfilePages(profile.username);
  redirect("/profile/edit");
}

export async function saveExperienceAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const experienceId = formString(formData, "experienceId");
  const isCurrent = formData.get("isCurrent") === "on";
  const parsed = experienceSchema.safeParse({
    company: formString(formData, "company"),
    description: formString(formData, "description"),
    endDate: isCurrent ? "" : formString(formData, "endDate"),
    experienceId: experienceId || undefined,
    isCurrent,
    position: formString(formData, "position"),
    startDate: formString(formData, "startDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid experience details." };
  }

  const values = parsed.data;
  const { error, profile, supabase, user } = await getOwnedProfile();

  if (error || !profile || !user) {
    return { error };
  }

  if (profile.role !== "alumni") {
    return { error: "Only alumni can manage professional experiences." };
  }

  const payload = {
    company: values.company,
    description: values.description || null,
    end_date: values.isCurrent ? null : values.endDate || null,
    is_current: values.isCurrent,
    position: values.position,
    start_date: values.startDate || null,
  };

  if (values.experienceId) {
    const { error: updateError } = await supabase
      .from("experiences")
      .update(payload)
      .eq("id", values.experienceId)
      .eq("user_id", user.id);

    if (updateError) {
      return { error: "Could not update experience." };
    }
  } else {
    const { error: insertError } = await supabase.from("experiences").insert({
      ...payload,
      user_id: user.id,
    });

    if (insertError) {
      return { error: "Could not add experience." };
    }
  }

  refreshProfilePages(profile.username);
  return {
    success: values.experienceId ? "Experience updated." : "Experience added.",
  };
}

export async function deleteExperienceAction(formData: FormData) {
  const parsed = uuidSchema.safeParse(formString(formData, "experienceId"));
  const { error, profile, supabase, user } = await getOwnedProfile();

  if (!parsed.success || error || !profile || !user || profile.role !== "alumni") {
    redirect("/profile/edit");
  }

  await supabase
    .from("experiences")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id);

  refreshProfilePages(profile.username);
  redirect("/profile/edit");
}

export async function updateAvatarUrlAction(avatarUrl: string): Promise<ActionState> {
  const { error, profile, supabase, user } = await getOwnedProfile();

  if (error || !profile || !user) {
    return { error: error || "Unauthorized." };
  }

  const { error: dbError } = await supabase
    .from("users")
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (dbError) {
    return { error: "Failed to update avatar." };
  }

  refreshProfilePages(profile.username);
  revalidatePath("/dashboard");
  revalidatePath("/discover");
  revalidatePath("/connections");

  return { success: "Avatar updated successfully." };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

