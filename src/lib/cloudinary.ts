import { v2 as cloudinary } from "cloudinary";

// Read environment variables with multiple fallback patterns
let cloudName =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME ||
  "";
let apiKey =
  process.env.CLOUDINARY_API_KEY ||
  process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
  "";
let apiSecret =
  process.env.CLOUDINARY_API_SECRET ||
  process.env.CLOUDINARY_SECRET ||
  "";

// Parse CLOUDINARY_URL if provided
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (cloudinaryUrl && (!cloudName || !apiKey || !apiSecret)) {
  try {
    const parsed = new URL(cloudinaryUrl);
    if (parsed.protocol === "cloudinary:") {
      apiKey = apiKey || parsed.username;
      apiSecret = apiSecret || parsed.password;
      cloudName = cloudName || parsed.hostname;
    }
  } catch {
    const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      const [, matchedKey, matchedSecret, matchedCloud] = match;
      apiKey = apiKey || matchedKey;
      apiSecret = apiSecret || matchedSecret;
      cloudName = cloudName || matchedCloud;
    }
  }
}

const isConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isConfigured) {
  cloudinary.config({
    api_key: apiKey,
    api_secret: apiSecret,
    cloud_name: cloudName,
    secure: true,
  });
}

export { cloudinary };

export type UploadAvatarResult = {
  height: number;
  publicId: string;
  secureUrl: string;
  width: number;
};

export type UploadMediaResult = {
  height: number;
  publicId: string;
  secureUrl: string;
  width: number;
};

function bufferToDataUri(buffer: Buffer | string, mimeType = "image/jpeg"): string {
  if (typeof buffer === "string") {
    if (buffer.startsWith("data:")) return buffer;
    return `data:${mimeType};base64,${buffer}`;
  }
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export async function uploadAvatar(
  fileBuffer: Buffer | string,
  userId?: string
): Promise<UploadAvatarResult> {
  if (!isConfigured) {
    console.warn("Cloudinary credentials not fully configured. Using fallback Data URI for avatar.");
    const dataUri = bufferToDataUri(fileBuffer);
    return {
      height: 400,
      publicId: userId ? `avatar_${userId}` : `avatar_${Date.now()}`,
      secureUrl: dataUri,
      width: 400,
    };
  }

  const options = {
    folder: "shongjog/avatars",
    invalidate: true,
    overwrite: true,
    public_id: userId ? `avatar_${userId}` : undefined,
    resource_type: "image" as const,
    transformation: [
      {
        crop: "fill",
        gravity: "face",
        height: 400,
        width: 400,
      },
      {
        fetch_format: "auto",
        quality: "auto",
      },
    ],
  };

  try {
    if (typeof fileBuffer === "string") {
      const result = await cloudinary.uploader.upload(fileBuffer, options);
      return {
        height: result.height,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        width: result.width,
      };
    }

    return await new Promise<UploadAvatarResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Failed to upload avatar to Cloudinary"));
          } else {
            resolve({
              height: result.height,
              publicId: result.public_id,
              secureUrl: result.secure_url,
              width: result.width,
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (err) {
    console.warn("Cloudinary upload failed, falling back to Data URI:", err);
    const dataUri = bufferToDataUri(fileBuffer);
    return {
      height: 400,
      publicId: userId ? `avatar_${userId}` : `avatar_${Date.now()}`,
      secureUrl: dataUri,
      width: 400,
    };
  }
}

export async function uploadMedia(
  fileBuffer: Buffer | string,
  folder = "shongjog/posts"
): Promise<UploadMediaResult> {
  if (!isConfigured) {
    console.warn(`Cloudinary credentials not fully configured. Using fallback Data URI for media in ${folder}.`);
    const dataUri = bufferToDataUri(fileBuffer);
    return {
      height: 720,
      publicId: `media_${Date.now()}`,
      secureUrl: dataUri,
      width: 1280,
    };
  }

  const options = {
    folder,
    resource_type: "image" as const,
    transformation: [
      {
        fetch_format: "auto",
        quality: "auto",
      },
    ],
  };

  try {
    if (typeof fileBuffer === "string") {
      const result = await cloudinary.uploader.upload(fileBuffer, options);
      return {
        height: result.height,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        width: result.width,
      };
    }

    return await new Promise<UploadMediaResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Failed to upload media to Cloudinary"));
          } else {
            resolve({
              height: result.height,
              publicId: result.public_id,
              secureUrl: result.secure_url,
              width: result.width,
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (err) {
    console.warn("Cloudinary media upload error, falling back to Data URI:", err);
    const dataUri = bufferToDataUri(fileBuffer);
    return {
      height: 720,
      publicId: `media_${Date.now()}`,
      secureUrl: dataUri,
      width: 1280,
    };
  }
}
