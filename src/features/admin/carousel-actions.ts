"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminCapability } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";

export type CarouselActionResult = { ok: true } | { ok: false; errors: Record<string, string[]> };

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

const carouselSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "标题不能为空").max(80, "标题最多 80 个字符"),
  imageUrl: z.string().trim().min(1, "图片地址不能为空").url("图片地址必须是有效 URL"),
  linkUrl: optionalText.refine((value) => !value || z.string().url().safeParse(value).success, "跳转地址必须是有效 URL"),
  description: optionalText.pipe(z.string().max(200, "描述最多 200 个字符")),
  sortOrder: optionalInt.default(0),
  enabled: z.preprocess((value) => value === "on", z.boolean())
});

const idSchema = z.object({
  id: z.string().trim().min(1)
});

function resultFromError(error: z.ZodError): CarouselActionResult {
  const errors = Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1])
    )
  );

  return { ok: false, errors };
}

export async function validateCarouselSlideInput(formData: FormData): Promise<CarouselActionResult> {
  const parsed = carouselSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return resultFromError(parsed.error);
  }

  return { ok: true };
}

function parseCarouselSlideInput(formData: FormData) {
  const parsed = carouselSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return null;
  }

  return {
    id: parsed.data.id,
    data: {
      title: parsed.data.title,
      imageUrl: parsed.data.imageUrl,
      linkUrl: parsed.data.linkUrl || null,
      description: parsed.data.description || "",
      sortOrder: parsed.data.sortOrder,
      enabled: parsed.data.enabled
    }
  };
}

function revalidateCarouselPaths() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/content/carousel");
}

export async function createCarouselSlide(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseCarouselSlideInput(formData);
  if (!input) {
    return;
  }

  await prisma.carouselSlide.create({ data: input.data });
  revalidateCarouselPaths();
  redirect("/admin/content/carousel");
}

export async function updateCarouselSlide(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseCarouselSlideInput(formData);
  if (!input?.id) {
    return;
  }

  await prisma.carouselSlide.update({
    where: { id: input.id },
    data: input.data
  });
  revalidateCarouselPaths();
  redirect("/admin/content/carousel");
}

export async function deleteCarouselSlide(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return;
  }

  await prisma.carouselSlide.delete({ where: { id: parsed.data.id } });
  revalidateCarouselPaths();
  redirect("/admin/content/carousel");
}
