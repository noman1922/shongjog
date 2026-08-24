"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const postSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write something before posting.")
    .max(2800, "Posts must be 2,800 characters or fewer."),
});

const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write a comment first.")
    .max(600, "Comments must be 600 characters or fewer."),
  postId: z.uuid(),
});

const postIdSchema = z.uuid();

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function getFeedActor() {
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
    return { error: "Complete your profile before using Home.", profile: null, supabase, user };
  }

  return { error: null, profile, supabase, user };
}

function refreshFeed(username?: string | null) {
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  if (username) {
    revalidatePath(`/profile/${username}`);
  }
}

export async function createPostAction(formData: FormData) {
  const parsed = postSchema.safeParse({
    content: formString(formData, "content"),
  });
  const imageUrl = formString(formData, "imageUrl");
  const { error, profile, supabase, user } = await getFeedActor();

  if (!parsed.success || error || !profile || !user) {
    redirect("/dashboard");
  }

  const { data: newPost } = await supabase
    .from("posts")
    .insert({
      content: parsed.data.content,
      post_type: "general",
      user_id: user.id,
    })
    .select("id")
    .single();

  if (newPost && imageUrl) {
    await supabase.from("post_media").insert({
      media_type: "image/jpeg",
      media_url: imageUrl,
      post_id: newPost.id,
      sort_order: 0,
    });
  }

  refreshFeed(profile.username);
  redirect("/dashboard");
}

export async function togglePostLikeAction(formData: FormData) {
  const parsed = postIdSchema.safeParse(formString(formData, "postId"));
  const { error, supabase, user } = await getFeedActor();

  if (!parsed.success || error || !user) {
    return { error: "Failed to toggle like" };
  }

  const { data: reaction } = await supabase
    .from("post_reactions")
    .select("id")
    .eq("post_id", parsed.data)
    .eq("user_id", user.id)
    .maybeSingle();

  if (reaction) {
    await supabase
      .from("post_reactions")
      .delete()
      .eq("id", reaction.id)
      .eq("user_id", user.id);
    return { liked: false };
  } else {
    await supabase.from("post_reactions").insert({
      post_id: parsed.data,
      reaction_type: "like",
      user_id: user.id,
    });
    return { liked: true };
  }
}

export async function addCommentAction(formData: FormData) {
  const parsed = commentSchema.safeParse({
    content: formString(formData, "content"),
    postId: formString(formData, "postId"),
  });
  const { error, profile, supabase, user } = await getFeedActor();

  if (!parsed.success || error || !profile || !user) {
    return { error: "Failed to add comment" };
  }

  const { data: post } = await supabase
    .from("posts")
    .select("id")
    .eq("id", parsed.data.postId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!post) {
    return { error: "Post not found" };
  }

  const { data: newComment, error: commentErr } = await supabase
    .from("comments")
    .insert({
      content: parsed.data.content,
      post_id: parsed.data.postId,
      user_id: user.id,
    })
    .select("id, content, created_at")
    .single();

  if (commentErr) {
    return { error: commentErr.message };
  }

  return {
    comment: newComment,
    success: true,
  };
}


export async function deleteOwnPostAction(formData: FormData) {
  const parsed = postIdSchema.safeParse(formString(formData, "postId"));
  const { error, profile, supabase, user } = await getFeedActor();

  if (!parsed.success || error || !profile || !user) {
    redirect("/dashboard");
  }

  await supabase
    .from("posts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", parsed.data)
    .eq("user_id", user.id);

  refreshFeed(profile.username);
  redirect("/dashboard");
}
