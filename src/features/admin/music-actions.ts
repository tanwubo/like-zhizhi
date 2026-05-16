import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminCapability } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";

export type MusicTrackActionResult = { ok: true } | { ok: false; errors: Record<string, string[]> };

const formText = (message: string, max?: [number, string]) => {
  let schema = z.string().trim().min(1, message);
  if (max) {
    schema = schema.max(max[0], max[1]);
  }

  return z.preprocess((value) => (typeof value === "string" ? value : ""), schema);
};

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value.trim() : null),
  z.string().url("地址必须是有效 URL").nullable()
);

const requiredUrl = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : ""),
  z.string().min(1, "音频地址不能为空").url("音频地址必须是有效 URL")
);

const optionalBoolean = z.preprocess((value) => value === "on" || value === "true", z.boolean());

const optionalInt = z.preprocess((value) => {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return Number(value);
}, z.number({ invalid_type_error: "排序必须是整数" }).int("排序必须是整数").optional());

const musicTrackSchema = z.object({
  id: z.string().optional(),
  title: formText("标题不能为空", [120, "标题最多 120 个字符"]),
  artist: formText("歌手不能为空", [120, "歌手最多 120 个字符"]),
  coverUrl: optionalUrl,
  sourceUrl: requiredUrl,
  sourceType: formText("来源类型不能为空", [40, "来源类型最多 40 个字符"]).default("url"),
  enabled: optionalBoolean.default(false),
  sortOrder: optionalInt.default(0)
});

const idSchema = z.object({
  id: z.string().trim().min(1)
});

function resultFromError(error: z.ZodError): MusicTrackActionResult {
  const errors = Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1])
    )
  );

  return { ok: false, errors };
}

export function validateMusicTrackInput(formData: FormData): MusicTrackActionResult {
  const parsed = musicTrackSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return resultFromError(parsed.error);
  }

  return { ok: true };
}

function parseMusicTrackInput(formData: FormData) {
  const parsed = musicTrackSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return null;
  }

  return {
    id: parsed.data.id,
    data: {
      title: parsed.data.title,
      artist: parsed.data.artist,
      coverUrl: parsed.data.coverUrl,
      sourceUrl: parsed.data.sourceUrl,
      sourceType: parsed.data.sourceType,
      enabled: parsed.data.enabled,
      sortOrder: parsed.data.sortOrder
    }
  };
}

function revalidateMusicPaths() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/content/music");
}

export async function createMusicTrack(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseMusicTrackInput(formData);
  if (!input) {
    return;
  }

  await prisma.musicTrack.create({ data: input.data });
  revalidateMusicPaths();
  redirect("/admin/content/music");
}

export async function updateMusicTrack(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseMusicTrackInput(formData);
  if (!input?.id) {
    return;
  }

  await prisma.musicTrack.update({
    where: { id: input.id },
    data: input.data
  });
  revalidateMusicPaths();
  redirect("/admin/content/music");
}

export async function deleteMusicTrack(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return;
  }

  await prisma.musicTrack.delete({ where: { id: parsed.data.id } });
  revalidateMusicPaths();
  redirect("/admin/content/music");
}
