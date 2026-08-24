"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminUser } from "@/lib/admin/permissions";
import { createClient } from "@/lib/supabase/server";

export type AdminActionResult = {
  error?: string;
  success?: boolean;
  message?: string;
};

const userStatusSchema = z.object({
  isActive: z.boolean(),
  userId: z.string().uuid(),
});

const userRoleSchema = z.object({
  role: z.enum(["student", "alumni", "admin"]),
  userId: z.string().uuid(),
});

const deleteUserSchema = z.object({
  userId: z.string().uuid(),
});

const moderatePostSchema = z.object({
  action: z.enum(["soft_delete", "restore", "hard_delete"]),
  postId: z.string().uuid(),
});

const moderateCommentSchema = z.object({
  commentId: z.string().uuid(),
});

const moderateStorySchema = z.object({
  storyId: z.string(),
});

const announcementSchema = z.object({
  bannerType: z.enum(["info", "warning", "success", "urgent"]).default("info"),
  content: z.string().min(1, "Please provide announcement details.").max(1000),
  targetAudience: z.enum(["all", "students", "alumni"]).default("all"),
  title: z.string().min(1, "Please provide an announcement title.").max(120),
});

export async function toggleUserStatusAction(
  userId: string,
  isActive: boolean
): Promise<AdminActionResult> {
  const admin = await requireAdminUser();

  const parsed = userStatusSchema.safeParse({ isActive, userId });
  if (!parsed.success) {
    return { error: "Invalid user details provided." };
  }

  if (admin.id === userId && !isActive) {
    return { error: "You cannot deactivate your own active admin account." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("users")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) {
    return { error: "Failed to update user status." };
  }

  revalidatePath("/admin");
  return { success: true, message: `User status changed to ${isActive ? "Active" : "Suspended"}.` };
}

export async function setUserRoleAction(
  userId: string,
  role: "student" | "alumni" | "admin"
): Promise<AdminActionResult> {
  const admin = await requireAdminUser();

  const parsed = userRoleSchema.safeParse({ role, userId });
  if (!parsed.success) {
    return { error: "Invalid role selection." };
  }

  if (admin.id === userId && role !== "admin") {
    return { error: "You cannot change your own admin role." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", userId);

  if (error) {
    return { error: "Failed to update user role." };
  }

  revalidatePath("/admin");
  return { success: true, message: `User role updated to ${role}.` };
}

export async function toggleVerifiedMentorAction(
  userId: string,
  isVerified: boolean
): Promise<AdminActionResult> {
  await requireAdminUser();
  const supabase = await createClient();

  // Updates alumni role or verified indicator
  const { error } = await supabase
    .from("users")
    .update({ role: isVerified ? "alumni" : "student" })
    .eq("id", userId);

  if (error) {
    return { error: "Failed to toggle mentor verification badge." };
  }

  revalidatePath("/admin");
  return {
    message: isVerified
      ? "User verified as Alumni Mentor."
      : "Alumni Mentor verification removed.",
    success: true,
  };
}

export async function deleteUserAccountAction(
  userId: string
): Promise<AdminActionResult> {
  const admin = await requireAdminUser();

  const parsed = deleteUserSchema.safeParse({ userId });
  if (!parsed.success) {
    return { error: "Invalid user ID." };
  }

  if (admin.id === userId) {
    return { error: "You cannot delete your own admin account." };
  }

  const supabase = await createClient();

  // Cascade delete related records
  await Promise.allSettled([
    supabase.from("student_profiles").delete().eq("user_id", userId),
    supabase.from("alumni_profiles").delete().eq("user_id", userId),
    supabase.from("user_skills").delete().eq("user_id", userId),
    supabase.from("posts").delete().eq("user_id", userId),
    supabase.from("comments").delete().eq("user_id", userId),
    supabase.from("stories").delete().eq("user_id", userId),
    supabase
      .from("connections")
      .delete()
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`),
  ]);

  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) {
    return { error: "Could not delete user account." };
  }

  revalidatePath("/admin");
  return { success: true, message: "User account permanently removed." };
}

export async function moderatePostAction(
  postId: string,
  action: "soft_delete" | "restore" | "hard_delete"
): Promise<AdminActionResult> {
  await requireAdminUser();

  const parsed = moderatePostSchema.safeParse({ action, postId });
  if (!parsed.success) {
    return { error: "Invalid post moderation action." };
  }

  const supabase = await createClient();

  if (action === "hard_delete") {
    await supabase.from("comments").delete().eq("post_id", postId);
    await supabase.from("post_reactions").delete().eq("post_id", postId);
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) return { error: "Failed to delete post." };
  } else if (action === "soft_delete") {
    const { error } = await supabase
      .from("posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", postId);
    if (error) return { error: "Failed to hide post." };
  } else if (action === "restore") {
    const { error } = await supabase
      .from("posts")
      .update({ deleted_at: null })
      .eq("id", postId);
    if (error) return { error: "Failed to restore post." };
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return {
    message:
      action === "hard_delete"
        ? "Post deleted permanently."
        : action === "soft_delete"
        ? "Post hidden from community feed."
        : "Post restored to community feed.",
    success: true,
  };
}

export async function moderateStoryAction(
  storyId: string
): Promise<AdminActionResult> {
  await requireAdminUser();

  const parsed = moderateStorySchema.safeParse({ storyId });
  if (!parsed.success) {
    return { error: "Invalid story ID." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("stories").delete().eq("id", storyId);

  if (error) {
    return { error: "Failed to remove story." };
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return { message: "Story successfully removed from network.", success: true };
}

export async function moderateCommentAction(
  commentId: string
): Promise<AdminActionResult> {
  await requireAdminUser();

  const parsed = moderateCommentSchema.safeParse({ commentId });
  if (!parsed.success) {
    return { error: "Invalid comment ID." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("comments").delete().eq("id", commentId);

  if (error) {
    return { error: "Failed to delete comment." };
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { message: "Comment removed successfully.", success: true };
}

export async function broadcastAnnouncementAction(payload: {
  bannerType?: "info" | "warning" | "success" | "urgent";
  content: string;
  targetAudience?: "all" | "students" | "alumni";
  title: string;
}): Promise<AdminActionResult> {
  const admin = await requireAdminUser();
  const parsed = announcementSchema.safeParse(payload);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid announcement details." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("system_announcements").insert({
      banner_type: parsed.data.bannerType,
      content: parsed.data.content,
      created_by: admin.id,
      is_active: true,
      target_audience: parsed.data.targetAudience,
      title: parsed.data.title,
    });

    if (error) {
      console.warn("Announcement insert error:", error);
    }

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");
    return {
      message: `Global announcement "${parsed.data.title}" broadcasted across Shongjog!`,
      success: true,
    };
  } catch (err) {
    console.error("Broadcast announcement exception:", err);
    return { error: "Failed to broadcast announcement.", success: false };
  }
}

export async function resetAndSeedFeedAction(): Promise<AdminActionResult> {
  await requireAdminUser();

  const supabase = await createClient();

  // 1. Clean out comments, reactions, and existing posts
  await Promise.allSettled([
    supabase.from("comments").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
    supabase.from("post_reactions").delete().neq("post_id", "00000000-0000-0000-0000-000000000000"),
  ]);

  await supabase.from("posts").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 2. Fetch all registered student and alumni users
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, role, full_name")
    .in("role", ["student", "alumni"]);

  if (usersError || !users || users.length === 0) {
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { message: "Feed cleared. No student/alumni users found to seed.", success: true };
  }

  // 3. Create 1 starter post for each user
  const postsToInsert = users.map((u) => {
    const isAlumni = u.role === "alumni";
    const content = isAlumni
      ? `Excited to connect with ambitious students here on Shongjog! Feel free to reach out for career guidance, software engineering insights, and upcoming internship openings.`
      : `Hello Shongjog community! Excited to connect with fellow students and alumni. Currently exploring new projects and looking forward to building my professional network.`;

    return {
      content,
      post_type: isAlumni ? "career" : "general",
      user_id: u.id,
    };
  });

  const { error: insertError } = await supabase.from("posts").insert(postsToInsert);

  if (insertError) {
    return { error: "Feed was cleared, but failed to insert starter posts." };
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return {
    message: `Feed successfully reset and seeded with ${postsToInsert.length} starter post(s)!`,
    success: true,
  };
}
