import { PublishStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { normalizeNoteSlug } from "@/features/admin/notes-data";
import { incrementDailyStat } from "@/server/analytics/visits";
import { requireAdminCapability } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";

export type NoteActionResult = { ok: true } | { ok: false; errors: Record<string, string[]> };

const formText = (message: string, max?: [number, string]) => {
  let schema = z.string().trim().min(1, message);
  if (max) {
    schema = schema.max(max[0], max[1]);
  }

  return z.preprocess((value) => (typeof value === "string" ? value : ""), schema);
};

const noteSchema = z.object({
  id: z.string().optional(),
  title: formText("标题不能为空", [120, "标题最多 120 个字符"]),
  slug: z.string().trim().optional(),
  excerpt: formText("摘要不能为空", [300, "摘要最多 300 个字符"]),
  content: formText("正文不能为空"),
  status: z.nativeEnum(PublishStatus).default(PublishStatus.DRAFT),
  mood: z.string().trim().optional(),
  weather: z.string().trim().optional(),
  location: z.string().trim().optional()
});

const idSchema = z.object({
  id: z.string().trim().min(1)
});

function resultFromError(error: z.ZodError): NoteActionResult {
  const errors = Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1])
    )
  );

  return { ok: false, errors };
}

export function validateNoteInput(formData: FormData): NoteActionResult {
  const parsed = noteSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return resultFromError(parsed.error);
  }

  const slug = normalizeNoteSlug(parsed.data.slug || parsed.data.title);
  if (!slug) {
    return { ok: false, errors: { slug: ["链接标识不能为空"] } };
  }

  return { ok: true };
}

function parseNoteInput(formData: FormData) {
  const parsed = noteSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return null;
  }

  const slug = normalizeNoteSlug(parsed.data.slug || parsed.data.title);
  if (!slug) {
    return null;
  }

  return {
    id: parsed.data.id,
    title: parsed.data.title,
    slug,
    excerpt: parsed.data.excerpt,
    content: parsed.data.content,
    status: parsed.data.status,
    mood: parsed.data.mood || null,
    weather: parsed.data.weather || null,
    location: parsed.data.location || null,
    publishedAt: parsed.data.status === PublishStatus.PUBLISHED ? new Date() : null
  };
}

async function slugExists(slug: string, currentId?: string) {
  const existing = await prisma.note.findFirst({
    where: currentId ? { slug, NOT: { id: currentId } } : { slug },
    select: { id: true }
  });

  return Boolean(existing);
}

function revalidateNotePaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/notes");
  if (slug) {
    revalidatePath(`/notes/${slug}`);
  }
  revalidatePath("/admin");
  revalidatePath("/admin/content/notes");
}

export async function createNote(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseNoteInput(formData);
  if (!input || (await slugExists(input.slug))) {
    return;
  }

  await prisma.note.create({
    data: {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      status: input.status,
      mood: input.mood,
      weather: input.weather,
      location: input.location,
      publishedAt: input.publishedAt
    }
  });

  if (input.status === PublishStatus.PUBLISHED) {
    await incrementDailyStat("notes");
  }

  revalidateNotePaths(input.slug);
  redirect("/admin/content/notes");
}

export async function updateNote(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseNoteInput(formData);
  if (!input?.id || (await slugExists(input.slug, input.id))) {
    return;
  }

  await prisma.note.update({
    where: { id: input.id },
    data: {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      status: input.status,
      mood: input.mood,
      weather: input.weather,
      location: input.location,
      publishedAt: input.publishedAt
    }
  });

  revalidateNotePaths(input.slug);
  redirect("/admin/content/notes");
}

export async function deleteNote(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return;
  }

  await prisma.note.delete({ where: { id: parsed.data.id } });
  revalidateNotePaths();
  redirect("/admin/content/notes");
}
