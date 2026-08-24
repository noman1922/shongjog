"use client";

import { Camera, Loader2, Upload, User } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { getInitials } from "@/lib/utils";

export { getInitials };

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  fullName?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  onUploadSuccess?: (url: string) => void;
  className?: string;
}

const sizeConfig = {
  sm: {
    container: "size-12",
    dimension: 48,
    textSize: "text-sm font-bold",
    iconSize: "size-3.5",
    badgeSize: "size-5",
  },
  md: {
    container: "size-16",
    dimension: 64,
    textSize: "text-base font-bold",
    iconSize: "size-4",
    badgeSize: "size-6",
  },
  lg: {
    container: "size-24 sm:size-28",
    dimension: 112,
    textSize: "text-2xl font-bold",
    iconSize: "size-5",
    badgeSize: "size-8",
  },
  xl: {
    container: "size-28 sm:size-36",
    dimension: 144,
    textSize: "text-3xl sm:text-4xl font-bold",
    iconSize: "size-6",
    badgeSize: "size-9",
  },
};

export function AvatarUpload({
  currentAvatarUrl,
  fullName,
  size = "lg",
  editable = true,
  onUploadSuccess,
  className = "",
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = sizeConfig[size] || sizeConfig.lg;
  const displayUrl = previewUrl || currentAvatarUrl;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size exceeds 5MB. Please choose a smaller photo.");
      return;
    }

    setError(null);
    setSuccess(false);

    // Optimistic local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to upload avatar to cloud.");
      }

      setPreviewUrl(data.avatarUrl);
      setSuccess(true);
      if (onUploadSuccess) {
        onUploadSuccess(data.avatarUrl);
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Avatar upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed.");
      // Revert optimistic preview if failed
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleContainerClick = () => {
    if (editable && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <div
        className={`group relative ${config.container} shrink-0 overflow-hidden rounded-full border-4 border-card bg-muted/60 dark:bg-slate-800 shadow-md ring-2 ring-primary/20 ${
          editable ? "cursor-pointer transition-all hover:ring-primary hover:shadow-lg" : ""
        }`}
        onClick={handleContainerClick}
        role={editable ? "button" : undefined}
        tabIndex={editable ? 0 : undefined}
        onKeyDown={(e) => {
          if (editable && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleContainerClick();
          }
        }}
        title={editable ? "Click to change profile picture" : undefined}
      >
        {displayUrl ? (
          <Image
            alt={fullName ? `${fullName}'s avatar` : "Profile picture"}
            className="size-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
            height={config.dimension}
            priority={size === "xl" || size === "lg"}
            src={displayUrl}
            unoptimized={displayUrl.startsWith("blob:")}
            width={config.dimension}
          />
        ) : (
          <div
            className={`flex size-full items-center justify-center rounded-full bg-primary/10 text-primary ${config.textSize}`}
          >
            {getInitials(fullName)}
          </div>
        )}

        {/* Hover / Loading Overlay */}
        {editable ? (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white backdrop-blur-[2px] transition-opacity duration-200 ${
              isUploading
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 group-focus:opacity-100"
            }`}
          >
            {isUploading ? (
              <Loader2 className={`${config.iconSize} animate-spin text-white`} />
            ) : (
              <>
                <Camera className={config.iconSize} />
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider">
                  {displayUrl ? "Change" : "Upload"}
                </span>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Hidden file input */}
      {editable ? (
        <input
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          aria-label="Upload profile photo"
          className="sr-only"
          disabled={isUploading}
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
      ) : null}

      {/* Status Feedback */}
      {error ? (
        <p className="mt-2 text-center text-xs font-medium text-destructive animate-in fade-in">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-2 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in">
          Photo updated!
        </p>
      ) : null}
    </div>
  );
}
