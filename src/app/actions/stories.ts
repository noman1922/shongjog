"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { uploadMedia } from "@/lib/cloudinary";
import { createClient } from "@/lib/supabase/server";

const storySchema = z.object({
  category: z.string().default("Campus Story"),
  description: z.string().optional(),
  headline: z.string().min(1, "Please provide a story headline."),
  mediaUrl: z.string().min(1, "Please attach a photo for your story."),
});

export type CreateStoryInput = {
  category?: string;
  description?: string;
  headline: string;
  mediaUrl: string;
};

export async function uploadStoryImageAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Please sign in to upload photos.", success: false };
    }

    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return { error: "No image file provided.", success: false };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { error: "Image size must be under 10MB.", success: false };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadMedia(buffer, "shongjog/stories");

    return { success: true, url: uploadResult.secureUrl };
  } catch (err) {
    console.error("Story image upload action error:", err);
    return {
      error: err instanceof Error ? err.message : "Failed to upload photo.",
      success: false,
    };
  }
}

export async function createStoryAction(payload: CreateStoryInput) {
  const parsed = storySchema.safeParse(payload);
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!parsed.success || authError || !user) {
    return {
      error:
        parsed.error?.issues[0]?.message || authError?.message || "Unauthorized.",
      success: false,
    };
  }

  try {
    const { data, error: insertError } = await supabase
      .from("stories")
      .insert({
        category: parsed.data.category,
        description: parsed.data.description || null,
        headline: parsed.data.headline,
        media_url: parsed.data.mediaUrl,
        user_id: user.id,
      })
      .select("id, created_at, expires_at")
      .maybeSingle();

    if (insertError) {
      console.warn("Story table insert notice (using local fallback):", insertError);
      return { error: insertError.message, offline: true, success: true };
    }

    revalidatePath("/dashboard");
    revalidatePath("/", "layout");
    return { id: data?.id, success: true };
  } catch (err) {
    console.error("Story creation exception:", err);
    return {
      error: err instanceof Error ? err.message : "Failed to save story.",
      offline: true,
      success: true,
    };
  }
}
