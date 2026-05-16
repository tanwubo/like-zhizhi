import { MediaType } from "@prisma/client";
import { z } from "zod";

export type MediaActionResult = { ok: true } | { ok: false; errors: Record<string, string[]> };

type ExternalMediaData = {
  type: MediaType;
  bucket: string;
  objectKey: string;
  publicUrl: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
};

export type ExternalMediaParseResult =
  | { ok: true; data: ExternalMediaData }
  | { ok: false; errors: Record<string, string[]> };

const optionalText = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : ""),
  z.string().optional()
);

const optionalInt = z.preprocess((value) => {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return Number(value);
}, z.number().int("必须是整数").min(0, "必须大于等于 0").optional());

const externalMediaSchema = z.object({
  publicUrl: z
    .preprocess((value) => (typeof value === "string" ? value.trim() : ""), z.string().min(1, "媒体地址不能为空"))
    .pipe(z.string().url("媒体地址必须是有效 URL")),
  filename: optionalText,
  contentType: optionalText,
  sizeBytes: optionalInt.default(0),
  width: optionalInt,
  height: optionalInt
});

const extensionContentTypes: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  pdf: "application/pdf"
};

export function detectMediaType(contentType: string, filename: string): MediaType {
  const normalizedContentType = contentType.toLowerCase();
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";

  if (normalizedContentType.startsWith("image/")) return MediaType.IMAGE;
  if (normalizedContentType.startsWith("video/")) return MediaType.VIDEO;
  if (normalizedContentType.startsWith("audio/")) return MediaType.AUDIO;
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) return MediaType.IMAGE;
  if (["mp4", "webm", "mov"].includes(extension)) return MediaType.VIDEO;
  if (["mp3", "m4a", "wav", "ogg"].includes(extension)) return MediaType.AUDIO;

  return MediaType.FILE;
}

export function inferContentType(filename: string, explicit?: string) {
  if (explicit?.trim()) {
    return explicit.trim();
  }

  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  return extensionContentTypes[extension] ?? "application/octet-stream";
}

export function filenameFromUrl(publicUrl: string) {
  const url = new URL(publicUrl);
  const lastSegment = url.pathname.split("/").filter(Boolean).pop();
  return decodeURIComponent(lastSegment || "media");
}

function sanitizeFilename(filename: string) {
  const trimmed = filename.trim().toLowerCase();
  const normalized = trimmed
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "media";
}

export function buildMediaObjectKey(filename: string, now = new Date()) {
  const safeFilename = sanitizeFilename(filename);
  const datePath = now.toISOString().slice(0, 10).replace(/-/g, "/");
  const timePrefix = now.toISOString().slice(11, 19).replace(/:/g, "");

  return `media/${datePath}/${timePrefix}-${safeFilename}`;
}

export function readImageDimensions(buffer: Buffer, contentType: string) {
  if (contentType === "image/png" && buffer.length >= 24 && buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20)
    };
  }

  if (
    (contentType === "image/jpeg" || contentType === "image/jpg") &&
    buffer.length > 4 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8
  ) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7)
        };
      }
      offset += 2 + length;
    }
  }

  return { width: null, height: null };
}

function errorsFromZod(error: z.ZodError): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1])
    )
  );
}

export function parseExternalMediaInput(formData: FormData): ExternalMediaParseResult {
  const parsed = externalMediaSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { ok: false, errors: errorsFromZod(parsed.error) };
  }

  const filename = parsed.data.filename || filenameFromUrl(parsed.data.publicUrl);
  const contentType = inferContentType(filename, parsed.data.contentType);
  const publicUrl = new URL(parsed.data.publicUrl);

  return {
    ok: true,
    data: {
      type: detectMediaType(contentType, filename),
      bucket: "external",
      objectKey: publicUrl.pathname || filename,
      publicUrl: parsed.data.publicUrl,
      filename,
      contentType,
      sizeBytes: parsed.data.sizeBytes,
      width: parsed.data.width ?? null,
      height: parsed.data.height ?? null
    }
  };
}

export function validateExternalMediaInput(formData: FormData): MediaActionResult {
  const parsed = parseExternalMediaInput(formData);
  return parsed.ok ? { ok: true } : { ok: false, errors: parsed.errors };
}
