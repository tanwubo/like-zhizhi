"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

import { extractExistingSecrets, parseIntegrationSettingsInput } from "@/features/admin/integration-utils";
import { requireAdminCapability } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";

type ActionResult = { ok: true } | { ok: false; errors: Record<string, string[]> };

export async function validateIntegrationSettings(formData: FormData): Promise<ActionResult> {
  const parsed = parseIntegrationSettingsInput(formData, {});

  if (!parsed.ok) {
    return { ok: false, errors: parsed.errors };
  }

  return { ok: true };
}

export async function updateIntegrationSettings(formData: FormData): Promise<void> {
  await requireAdminCapability("integrations");

  const existingRows = await prisma.integrationSetting.findMany();
  const parsed = parseIntegrationSettingsInput(formData, extractExistingSecrets(existingRows));

  if (!parsed.ok) {
    return;
  }

  await Promise.all(
    Object.values(parsed.records).map((record) => {
      const config = record.config as Prisma.InputJsonObject;
      const secrets = record.secrets as Prisma.InputJsonObject;

      return prisma.integrationSetting.upsert({
        where: { key: record.key },
        create: {
          key: record.key,
          enabled: record.enabled,
          provider: record.provider,
          config,
          secrets
        },
        update: {
          enabled: record.enabled,
          provider: record.provider,
          config,
          secrets
        }
      });
    })
  );

  revalidatePath("/admin");
  revalidatePath("/admin/integrations");
  redirect("/admin/integrations?saved=1");
}
