import { PublishStatus } from "@prisma/client";
import { z } from "zod";

import { normalizeNoteSlug } from "@/features/admin/notes-data";

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
