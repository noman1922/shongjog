import { NextResponse } from "next/server";

import { uploadMedia } from "@/lib/cloudinary";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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
      (formData.get("image") as File | null) ||
      (formData.get("media") as File | null);
    const folder = (formData.get("folder") as string | null) || "shongjog/posts";

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
        { error: "Image is too large. Maximum file size is 10MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary under folder (e.g. shongjog/posts or shongjog/stories)
    // NOTE: This does NOT update public.users.avatar_url!
    const uploadResult = await uploadMedia(buffer, folder);

    return NextResponse.json({
      height: uploadResult.height,
      publicId: uploadResult.publicId,
      success: true,
      url: uploadResult.secureUrl,
      width: uploadResult.width,
    });
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while uploading media.",
      },
      { status: 500 }
    );
  }
}
