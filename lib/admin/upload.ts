/**
 * Direct browser → Cloudinary uploads.
 *
 * 1. The API signs the upload (it alone holds the Cloudinary secret).
 * 2. The file goes straight to Cloudinary, with progress — large videos never
 *    pass through the API.
 * 3. The API verifies Cloudinary's signed response and records the asset.
 */

import { adminFetch, AdminApiError, type MediaOut } from "./api";

type Signature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  uploadUrl: string;
};

type CloudinaryResult = {
  public_id: string;
  version: number;
  signature: string;
  resource_type: string;
  format?: string;
  secure_url: string;
  width?: number;
  height?: number;
  bytes?: number;
  duration?: number;
  original_filename?: string;
  error?: { message: string };
};

/** Cloudinary free-plan limits. */
export const LIMITS = { image: 10 * 1024 * 1024, video: 100 * 1024 * 1024 };

export const ACCEPT = {
  image: "image/*",
  video: "video/*",
  any: "image/*,video/*",
} as const;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Why this file cannot be uploaded, or null when it can. */
export function rejectReason(file: File, kind: keyof typeof ACCEPT): string | null {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) return `${file.name} is not an image or a video.`;
  if (kind === "image" && !isImage) return `${file.name} is not an image.`;
  if (kind === "video" && !isVideo) return `${file.name} is not a video.`;
  const limit = isVideo ? LIMITS.video : LIMITS.image;
  if (file.size > limit) return `${file.name} is ${formatBytes(file.size)} — the limit is ${formatBytes(limit)}.`;
  return null;
}

function send(url: string, form: FormData, onProgress?: (fraction: number) => void): Promise<CloudinaryResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      let body: CloudinaryResult | null = null;
      try {
        body = JSON.parse(xhr.responseText) as CloudinaryResult;
      } catch {
        /* handled below */
      }
      if (xhr.status >= 200 && xhr.status < 300 && body) resolve(body);
      else reject(new AdminApiError(xhr.status, body?.error?.message ?? `Cloudinary upload failed (${xhr.status}).`));
    };
    xhr.onerror = () => reject(new AdminApiError(0, "Upload failed — check your connection."));
    xhr.send(form);
  });
}

export async function uploadToCloudinary(file: File, onProgress?: (fraction: number) => void): Promise<MediaOut> {
  const sig = await adminFetch<Signature>("/api/admin/media/sign", { method: "POST" });
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("folder", sig.folder);
  form.append("signature", sig.signature);

  const result = await send(sig.uploadUrl, form, onProgress);
  if (result.resource_type !== "image" && result.resource_type !== "video") {
    throw new AdminApiError(400, `${file.name} was not recognised as an image or a video.`);
  }
  return adminFetch<MediaOut>("/api/admin/media", {
    method: "POST",
    body: {
      publicId: result.public_id,
      version: result.version,
      signature: result.signature,
      resourceType: result.resource_type,
      format: result.format ?? "",
      secureUrl: result.secure_url,
      width: result.width ?? null,
      height: result.height ?? null,
      bytes: result.bytes ?? file.size,
      duration: result.duration ?? null,
      originalFilename: (result.original_filename ?? file.name).slice(0, 300),
      alt: "",
    },
  });
}
