"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminCapability } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";

type ActionResult = { ok: true } | { ok: false; errors: Record<string, string[]> };

const siteSchema = z.object({
  title: z.string().trim().min(1, "站点名称不能为空").max(80, "站点名称最多 80 个字符"),
  slogan: z.string().trim().min(1, "标语不能为空").max(120, "标语最多 120 个字符"),
  description: z.string().trim().min(1, "描述不能为空").max(500, "描述最多 500 个字符"),
  footerText: z.string().trim().min(1, "页脚不能为空").max(120, "页脚最多 120 个字符"),
  icpText: z.string().trim().optional(),
  policeText: z.string().trim().optional(),
  seoKeywords: z.string().trim().optional()
});

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || z.string().url().safeParse(value).success, "请输入有效的 URL");

const themeSchema = z.object({
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "主色必须是 6 位十六进制颜色"),
  backgroundImageUrl: optionalUrl,
  backgroundVideoUrl: optionalUrl,
  enableGlassEffect: z.preprocess((value) => value === "on", z.boolean()),
  enablePageAnimation: z.preprocess((value) => value === "on", z.boolean())
});

const personSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().trim().min(1, "名称不能为空").max(40, "名称最多 40 个字符"),
  location: z.string().trim().optional(),
  bio: z.string().trim().max(300, "简介最多 300 个字符")
});

function resultFromError(error: z.ZodError): ActionResult {
  const errors = Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1])
    )
  );

  return { ok: false, errors };
}

function refreshAdminAndPublic() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/settings/site");
  revalidatePath("/admin/settings/people");
  revalidatePath("/admin/settings/modules");
}

function refreshTheme() {
  revalidatePath("/");
  revalidatePath("/notes");
  revalidatePath("/messages");
  revalidatePath("/footprints");
  revalidatePath("/album");
  revalidatePath("/checklist");
  revalidatePath("/love-days");
  revalidatePath("/about");
  revalidatePath("/admin");
  revalidatePath("/admin/settings/theme");
}

export async function validateSiteSettings(formData: FormData): Promise<ActionResult> {
  const parsed = siteSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return resultFromError(parsed.error);
  }

  return { ok: true };
}

export async function updateSiteSettings(formData: FormData): Promise<void> {
  await requireAdminCapability("settings");

  const parsed = siteSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  await prisma.siteSetting.update({
    where: { id: "site" },
    data: {
      title: parsed.data.title,
      slogan: parsed.data.slogan,
      description: parsed.data.description,
      footerText: parsed.data.footerText,
      icpText: parsed.data.icpText || null,
      policeText: parsed.data.policeText || null,
      seoKeywords: parsed.data.seoKeywords ?? ""
    }
  });

  refreshAdminAndPublic();
}

export async function validateThemeSettings(formData: FormData): Promise<ActionResult> {
  const parsed = themeSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return resultFromError(parsed.error);
  }

  return { ok: true };
}

export async function updateThemeSettings(formData: FormData): Promise<void> {
  await requireAdminCapability("settings");

  const parsed = themeSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const data = {
    primaryColor: parsed.data.primaryColor,
    backgroundImageUrl: parsed.data.backgroundImageUrl || null,
    backgroundVideoUrl: parsed.data.backgroundVideoUrl || null,
    enableGlassEffect: parsed.data.enableGlassEffect,
    enablePageAnimation: parsed.data.enablePageAnimation
  };

  await prisma.themeSetting.upsert({
    where: { id: "theme" },
    create: { id: "theme", ...data },
    update: data
  });

  refreshTheme();
}

export async function updatePersonProfile(formData: FormData): Promise<void> {
  await requireAdminCapability("settings");

  const parsed = personSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  await prisma.personProfile.update({
    where: { id: parsed.data.id },
    data: {
      displayName: parsed.data.displayName,
      location: parsed.data.location || null,
      bio: parsed.data.bio
    }
  });

  refreshAdminAndPublic();
}

export async function updateModuleSettings(formData: FormData): Promise<void> {
  await requireAdminCapability("settings");

  const ids = formData.getAll("moduleId").map(String);
  const enabledIds = new Set(formData.getAll("enabled").map(String));

  await Promise.all(
    ids.map((id) =>
      prisma.moduleSetting.update({
        where: { id },
        data: { enabled: enabledIds.has(id) }
      })
    )
  );

  refreshAdminAndPublic();
}
