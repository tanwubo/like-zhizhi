import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminCapability } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";

export type LoveDayActionResult = { ok: true } | { ok: false; errors: Record<string, string[]> };

const formText = (message: string, max?: [number, string]) => {
  let schema = z.string().trim().min(1, message);
  if (max) {
    schema = schema.max(max[0], max[1]);
  }

  return z.preprocess((value) => (typeof value === "string" ? value : ""), schema);
};

const optionalBoolean = z.preprocess((value) => value === "on" || value === "true", z.boolean());

const optionalInt = z.preprocess((value) => {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return Number(value);
}, z.number({ invalid_type_error: "排序必须是整数" }).int("排序必须是整数").optional());

const dateField = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : ""),
  z
    .string()
    .min(1, "日期不能为空")
    .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), "日期必须是有效日期")
);

const loveDaySchema = z.object({
  id: z.string().optional(),
  title: formText("标题不能为空", [120, "标题最多 120 个字符"]),
  description: formText("说明不能为空", [1000, "说明最多 1000 个字符"]),
  date: dateField,
  yearly: optionalBoolean.default(false),
  lunar: optionalBoolean.default(false),
  sortOrder: optionalInt.default(0)
});

const idSchema = z.object({
  id: z.string().trim().min(1)
});

function resultFromError(error: z.ZodError): LoveDayActionResult {
  const errors = Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1])
    )
  );

  return { ok: false, errors };
}

export function validateLoveDayInput(formData: FormData): LoveDayActionResult {
  const parsed = loveDaySchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return resultFromError(parsed.error);
  }

  return { ok: true };
}

function parseDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseLoveDayInput(formData: FormData) {
  const parsed = loveDaySchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return null;
  }

  const date = parseDate(parsed.data.date);
  if (!date) {
    return null;
  }

  return {
    id: parsed.data.id,
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      date,
      yearly: parsed.data.yearly,
      lunar: parsed.data.lunar,
      sortOrder: parsed.data.sortOrder
    }
  };
}

function revalidateLoveDayPaths() {
  revalidatePath("/");
  revalidatePath("/love-days");
  revalidatePath("/admin");
  revalidatePath("/admin/content/love-days");
}

export async function createLoveDayEvent(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseLoveDayInput(formData);
  if (!input) {
    return;
  }

  await prisma.loveDayEvent.create({ data: input.data });
  revalidateLoveDayPaths();
  redirect("/admin/content/love-days");
}

export async function updateLoveDayEvent(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseLoveDayInput(formData);
  if (!input?.id) {
    return;
  }

  await prisma.loveDayEvent.update({
    where: { id: input.id },
    data: input.data
  });
  revalidateLoveDayPaths();
  redirect("/admin/content/love-days");
}

export async function deleteLoveDayEvent(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return;
  }

  await prisma.loveDayEvent.delete({ where: { id: parsed.data.id } });
  revalidateLoveDayPaths();
  redirect("/admin/content/love-days");
}
