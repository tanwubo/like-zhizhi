import { PublishStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminCapability } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";

export type ChecklistActionResult = { ok: true } | { ok: false; errors: Record<string, string[]> };

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

const optionalBoolean = z.preprocess((value) => value === "on" || value === "true", z.boolean());

const optionalDateField = (message: string) =>
  optionalText.pipe(
    z.string().refine((value) => !value || !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), message)
  );

const optionalUrlField = optionalText.pipe(
  z.string().refine((value) => {
    if (!value) {
      return true;
    }

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, "图片地址必须是有效 URL")
);

const checklistSchema = z.object({
  id: z.string().optional(),
  title: formText("标题不能为空", [120, "标题最多 120 个字符"]),
  description: optionalText.pipe(z.string().max(1000, "说明最多 1000 个字符")),
  status: z.nativeEnum(PublishStatus).default(PublishStatus.DRAFT),
  completed: optionalBoolean.default(false),
  completedAt: optionalDateField("完成日期必须是有效日期"),
  targetDate: optionalDateField("目标日期必须是有效日期"),
  location: optionalText,
  imageUrl: optionalUrlField,
  sortOrder: optionalInt.default(0)
});

const idSchema = z.object({
  id: z.string().trim().min(1)
});

function resultFromError(error: z.ZodError): ChecklistActionResult {
  const errors = Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1])
    )
  );

  return { ok: false, errors };
}

export function validateChecklistInput(formData: FormData): ChecklistActionResult {
  const parsed = checklistSchema.safeParse(Object.fromEntries(formData));

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

function parseChecklistInput(formData: FormData) {
  const parsed = checklistSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return null;
  }

  return {
    id: parsed.data.id,
    data: {
      title: parsed.data.title,
      description: parsed.data.description || "",
      status: parsed.data.status,
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? optionalDate(parsed.data.completedAt) : null,
      targetDate: optionalDate(parsed.data.targetDate),
      location: parsed.data.location || null,
      imageUrl: parsed.data.imageUrl || null,
      sortOrder: parsed.data.sortOrder
    }
  };
}

function revalidateChecklistPaths() {
  revalidatePath("/");
  revalidatePath("/checklist");
  revalidatePath("/admin");
  revalidatePath("/admin/content/checklist");
}

export async function createChecklistItem(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseChecklistInput(formData);
  if (!input) {
    return;
  }

  await prisma.checklistItem.create({ data: input.data });
  revalidateChecklistPaths();
  redirect("/admin/content/checklist");
}

export async function updateChecklistItem(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseChecklistInput(formData);
  if (!input?.id) {
    return;
  }

  await prisma.checklistItem.update({
    where: { id: input.id },
    data: input.data
  });
  revalidateChecklistPaths();
  redirect("/admin/content/checklist");
}

export async function deleteChecklistItem(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return;
  }

  await prisma.checklistItem.delete({ where: { id: parsed.data.id } });
  revalidateChecklistPaths();
  redirect("/admin/content/checklist");
}
