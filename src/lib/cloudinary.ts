import { v2 as cloudinary } from "cloudinary";

const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  api_key: apiKey,
  api_secret: apiSecret,
  cloud_name: cloudName,
  secure: true,
});

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

export async function uploadAvatar(
  fileBuffer: Buffer | string,
  userId?: string
): Promise<UploadAvatarResult> {
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

  if (typeof fileBuffer === "string") {
    const result = await cloudinary.uploader.upload(fileBuffer, options);
    return {
      height: result.height,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      width: result.width,
    };
  }

  return new Promise<UploadAvatarResult>((resolve, reject) => {
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
}

export async function uploadMedia(
  fileBuffer: Buffer | string,
  folder = "shongjog/posts"
): Promise<UploadMediaResult> {
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

  if (typeof fileBuffer === "string") {
    const result = await cloudinary.uploader.upload(fileBuffer, options);
    return {
      height: result.height,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      width: result.width,
    };
  }

  return new Promise<UploadMediaResult>((resolve, reject) => {
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
}
