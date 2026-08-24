"use client";

import {
  Image as ImageIcon,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";

import { createPostAction } from "@/app/dashboard/actions";
import { ShongjogCard } from "@/components/shongjog/surface";
import type { PublicProfile } from "@/lib/profile/types";
import { getInitials } from "@/lib/utils";

function Avatar({ profile }: { profile: PublicProfile }) {
  if (profile.avatarUrl) {
    return (
      <div className="relative size-11 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20 shadow-sm">
        <Image
          alt={profile.fullName ?? "Avatar"}
          className="size-full rounded-full object-cover"
          height={44}
          src={profile.avatarUrl}
          width={44}
        />
      </div>
    );
  }

  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm ring-2 ring-primary/20">
      {getInitials(profile.fullName)}
    </div>
  );
}

export function CreatePost({ profile }: { profile: PublicProfile }) {
  const [content, setContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image exceeds 5MB size limit.");
      return;
    }

    setUploadError(null);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "shongjog/posts");

      const response = await fetch("/api/upload/media", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to upload image.");
      }

      setUploadedImageUrl(data.url);
      setPreviewUrl(data.url);
    } catch (err) {
      console.error("Post image upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
      setPreviewUrl(null);
      setUploadedImageUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || isUploading) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("content", content.trim());
      if (uploadedImageUrl) {
        formData.set("imageUrl", uploadedImageUrl);
      }
      await createPostAction(formData);
      setContent("");
      setPreviewUrl(null);
      setUploadedImageUrl(null);
    });
  };

  return (
    <ShongjogCard className="overflow-hidden border-border/80 dark:border-slate-800 p-5">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3.5">
          <Avatar profile={profile} />
          <div className="min-w-0 flex-1">
            <label className="block">
              <span className="sr-only">Share an update, project, or question</span>
              <textarea
                className="min-h-24 w-full resize-none rounded-2xl border border-border/70 dark:border-slate-700 bg-muted/50 dark:bg-slate-800/60 p-3.5 text-sm leading-6 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:bg-card dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary/10"
                maxLength={2800}
                name="content"
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share an update, question, or accomplishment with your network..."
                required
                value={content}
              />
            </label>

            {/* Image Preview Thumbnail */}
            {previewUrl ? (
              <div className="relative mt-3 inline-block overflow-hidden rounded-2xl border border-border/80 dark:border-slate-700 max-h-60 shadow-sm">
                <Image
                  alt="Post attachment preview"
                  className="max-h-56 w-auto object-cover rounded-xl"
                  height={224}
                  src={previewUrl}
                  width={360}
                />
                {isUploading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white backdrop-blur-xs">
                    <Loader2 className="size-6 animate-spin" />
                    <span className="text-[11px] font-semibold mt-1">Uploading...</span>
                  </div>
                ) : (
                  <button
                    aria-label="Remove image"
                    className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                    onClick={handleRemoveImage}
                    type="button"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ) : null}

            {uploadError ? (
              <p className="mt-2 text-xs font-medium text-destructive">
                {uploadError}
              </p>
            ) : null}
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />

        <div className="mt-3.5 flex flex-col gap-3 border-t border-border/60 dark:border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 dark:bg-primary/15 px-3 py-1 text-primary font-medium">
              <Sparkles className="size-3.5 text-primary" />
              Academic Network
            </span>

            <button
              className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary px-3 py-1 text-muted-foreground transition-colors cursor-pointer"
              disabled={isUploading || isPending}
              onClick={handleMediaClick}
              type="button"
            >
              <ImageIcon className="size-3.5" />
              <span>{previewUrl ? "Change Media" : "Add Photo"}</span>
            </button>
          </div>

          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            disabled={!content.trim() || isUploading || isPending}
            type="submit"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            <span>{isPending ? "Posting..." : "Post"}</span>
          </button>
        </div>
      </form>
    </ShongjogCard>
  );
}
