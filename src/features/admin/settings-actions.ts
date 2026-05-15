"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

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

export async function validateSiteSettings(formData: FormData): Promise<ActionResult> {
  const parsed = siteSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return resultFromError(parsed.error);
  }

  return { ok: true };
}

export async function updateSiteSettings(formData: FormData): Promise<void> {
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

export async function updatePersonProfile(formData: FormData): Promise<void> {
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
