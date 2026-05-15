import { MediaType, PublishStatus } from "@prisma/client";
import { z } from "zod";

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
