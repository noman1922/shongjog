import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { uploadAvatar } from "@/lib/cloudinary";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file =
      (formData.get("file") as File | null) ||
      (formData.get("avatar") as File | null) ||
      (formData.get("image") as File | null);

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image format. Please upload JPEG, PNG, WebP, or GIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image is too large. Maximum file size is 5MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadAvatar(buffer, user.id);

    const { error: dbError } = await supabase
      .from("users")
      .update({
        avatar_url: uploadResult.secureUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (dbError) {
      return NextResponse.json(
        { error: "Failed to update profile avatar in database." },
        { status: 500 }
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/profile");
    revalidatePath("/profile/edit");
    revalidatePath("/discover");
    revalidatePath("/connections");

    return NextResponse.json({
      avatarUrl: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
      success: true,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while uploading avatar.",
      },
      { status: 500 }
    );
  }
}
