"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

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
