import { MediaType, PublishStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminCapability } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";

export type AlbumActionResult = { ok: true } | { ok: false; errors: Record<string, string[]> };

const formText = (message: string, max?: [number, string]) => {
  let schema = z.string().trim().min(1, message);
  if (max) {
    schema = schema.max(max[0], max[1]);
  }

  return z.preprocess((value) => (typeof value === "string" ? value : ""), schema);
};

const optionalText = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : ""),
  z.string().optional()
);

const optionalInt = z.preprocess((value) => {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return Number(value);
}, z.number().int().optional());

const albumSchema = z.object({
  id: z.string().optional(),
  mediaId: z.string().optional(),
  title: formText("标题不能为空", [120, "标题最多 120 个字符"]),
  caption: optionalText.pipe(z.string().max(500, "说明最多 500 个字符")),
  publicUrl: formText("媒体地址不能为空").pipe(z.string().url("媒体地址必须是有效 URL")),
  mediaType: z.nativeEnum(MediaType).default(MediaType.IMAGE),
  status: z.nativeEnum(PublishStatus).default(PublishStatus.DRAFT),
  takenAt: optionalText,
  location: optionalText,
  authorLabel: optionalText,
  sortOrder: optionalInt.default(0),
  filename: optionalText,
  contentType: optionalText,
  sizeBytes: optionalInt.default(0),
  width: optionalInt,
  height: optionalInt
});

const idSchema = z.object({
  id: z.string().trim().min(1)
});

function resultFromError(error: z.ZodError): AlbumActionResult {
  const errors = Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1])
    )
  );

  return { ok: false, errors };
}

export function validateAlbumInput(formData: FormData): AlbumActionResult {
  const parsed = albumSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return resultFromError(parsed.error);
  }

  return { ok: true };
}

function optionalDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function filenameFromUrl(publicUrl: string) {
  const url = new URL(publicUrl);
  const lastSegment = url.pathname.split("/").filter(Boolean).pop();
  return decodeURIComponent(lastSegment || "media");
}

function contentTypeFor(type: MediaType, filename: string, explicit?: string) {
  if (explicit) {
    return explicit;
  }

  const extension = filename.split(".").pop()?.toLowerCase();
  if (type === MediaType.IMAGE) {
    if (extension === "png") return "image/png";
    if (extension === "webp") return "image/webp";
    if (extension === "gif") return "image/gif";
    return "image/jpeg";
  }
  if (type === MediaType.VIDEO) {
    return extension === "webm" ? "video/webm" : "video/mp4";
  }

  return "application/octet-stream";
}

function parseAlbumInput(formData: FormData) {
  const parsed = albumSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return null;
  }

  const filename = parsed.data.filename || filenameFromUrl(parsed.data.publicUrl);
  const publicUrl = new URL(parsed.data.publicUrl);

  return {
    id: parsed.data.id,
    mediaId: parsed.data.mediaId,
    media: {
      type: parsed.data.mediaType,
      bucket: "external",
      objectKey: publicUrl.pathname || filename,
      publicUrl: parsed.data.publicUrl,
      filename,
      contentType: contentTypeFor(parsed.data.mediaType, filename, parsed.data.contentType),
      sizeBytes: parsed.data.sizeBytes,
      width: parsed.data.width ?? null,
      height: parsed.data.height ?? null
    },
    album: {
      title: parsed.data.title,
      caption: parsed.data.caption || "",
      status: parsed.data.status,
      takenAt: optionalDate(parsed.data.takenAt),
      location: parsed.data.location || null,
      authorLabel: parsed.data.authorLabel || null,
      sortOrder: parsed.data.sortOrder
    }
  };
}

function revalidateAlbumPaths() {
  revalidatePath("/");
  revalidatePath("/album");
  revalidatePath("/admin");
  revalidatePath("/admin/content/album");
}

export async function createAlbumItem(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseAlbumInput(formData);
  if (!input) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const media = await tx.mediaAsset.create({ data: input.media });
    await tx.albumItem.create({
      data: {
        ...input.album,
        mediaId: media.id
      }
    });
  });

  revalidateAlbumPaths();
  redirect("/admin/content/album");
}

export async function updateAlbumItem(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseAlbumInput(formData);
  if (!input?.id || !input.mediaId) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.mediaAsset.update({
      where: { id: input.mediaId },
      data: input.media
    });
    await tx.albumItem.update({
      where: { id: input.id },
      data: input.album
    });
  });

  revalidateAlbumPaths();
  redirect("/admin/content/album");
}

export async function deleteAlbumItem(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return;
  }

  await prisma.albumItem.delete({ where: { id: parsed.data.id } });
  revalidateAlbumPaths();
  redirect("/admin/content/album");
}
