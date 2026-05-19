import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { requireAdminCapability } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";

export type FootprintActionResult = { ok: true } | { ok: false; errors: Record<string, string[]> };

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

const coordinate = (requiredMessage: string, rangeMessage: string, min: number, max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string" || !value.trim()) {
      return undefined;
    }

    return Number(value);
  }, z.number({ required_error: requiredMessage }).min(min, rangeMessage).max(max, rangeMessage));

const optionalCoordinate = (rangeMessage: string, min: number, max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string" || !value.trim()) {
      return undefined;
    }

    return Number(value);
  }, z.number().min(min, rangeMessage).max(max, rangeMessage).optional());

const integerField = (requiredMessage: string, message: string) =>
  z.preprocess((value) => {
    if (typeof value !== "string" || !value.trim()) {
      return undefined;
    }

    return Number(value);
  }, z.number({ required_error: requiredMessage }).int(message));

const optionalIntegerField = (message: string) =>
  z.preprocess((value) => {
    if (typeof value !== "string" || !value.trim()) {
      return undefined;
    }

    return Number(value);
  }, z.number().int(message).optional());

const requiredDateField = (message: string) =>
  z.preprocess((value) => {
    if (typeof value !== "string" || !value.trim()) {
      return undefined;
    }

    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }, z.date({ required_error: message }));

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
  }, "封面地址必须是有效 URL")
);

const citySchema = z.object({
  id: z.string().optional(),
  name: formText("城市名称不能为空", [120, "城市名称最多 120 个字符"]),
  description: optionalText.pipe(z.string().max(1000, "城市说明最多 1000 个字符")),
  latitude: coordinate("纬度不能为空", "纬度必须在 -90 到 90 之间", -90, 90),
  longitude: coordinate("经度不能为空", "经度必须在 -180 到 180 之间", -180, 180),
  amapAdcode: optionalText,
  amapCityCode: optionalText,
  coverUrl: optionalUrlField,
  sortOrder: integerField("排序值不能为空", "排序值必须是整数"),
  enabled: z.preprocess((value) => value === "on" || value === "true", z.boolean())
});

const memorySchema = z.object({
  id: z.string().optional(),
  placeId: z.string().trim().min(1, "城市不能为空"),
  locationName: formText("地点名称不能为空", [120, "地点名称最多 120 个字符"]),
  address: optionalText.pipe(z.string().max(240, "地址最多 240 个字符")),
  amapPoiId: optionalText,
  latitude: optionalCoordinate("纬度必须在 -90 到 90 之间", -90, 90),
  longitude: optionalCoordinate("经度必须在 -180 到 180 之间", -180, 180),
  visitedAt: requiredDateField("纪念日期不能为空"),
  mood: optionalText.pipe(z.string().max(80, "心情短句最多 80 个字符")),
  story: optionalText.pipe(z.string().max(2000, "故事最多 2000 个字符")),
  sortOrder: optionalIntegerField("排序值必须是整数"),
  mediaAssetIds: z.preprocess(
    (value) => (Array.isArray(value) ? value : typeof value === "string" ? [value] : []),
    z.array(z.string().trim().min(1)).default([])
  )
});

const idSchema = z.object({
  id: z.string().trim().min(1)
});

function resultFromError(error: z.ZodError): FootprintActionResult {
  const errors = Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1])
    )
  );

  return { ok: false, errors };
}

export function validateFootprintCityInput(formData: FormData): FootprintActionResult {
  const parsed = citySchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return resultFromError(parsed.error);
  }

  return { ok: true };
}

export function validateFootprintMemoryInput(formData: FormData): FootprintActionResult {
  const parsed = memorySchema.safeParse({
    ...Object.fromEntries(formData),
    mediaAssetIds: formData.getAll("mediaAssetIds")
  });

  if (!parsed.success) {
    return resultFromError(parsed.error);
  }

  return { ok: true };
}

function parseCityInput(formData: FormData) {
  const parsed = citySchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return null;
  }

  return {
    id: parsed.data.id,
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? "",
      latitude: String(parsed.data.latitude),
      longitude: String(parsed.data.longitude),
      amapAdcode: parsed.data.amapAdcode || null,
      amapCityCode: parsed.data.amapCityCode || null,
      coverUrl: parsed.data.coverUrl || null,
      sortOrder: parsed.data.sortOrder,
      enabled: parsed.data.enabled
    }
  };
}

function parseMemoryInput(formData: FormData) {
  const parsed = memorySchema.safeParse({
    ...Object.fromEntries(formData),
    mediaAssetIds: formData.getAll("mediaAssetIds")
  });

  if (!parsed.success) {
    return null;
  }

  return {
    id: parsed.data.id,
    placeId: parsed.data.placeId,
    mediaAssetIds: Array.from(new Set(parsed.data.mediaAssetIds)),
    data: {
      placeId: parsed.data.placeId,
      locationName: parsed.data.locationName,
      address: parsed.data.address ?? "",
      amapPoiId: parsed.data.amapPoiId || null,
      latitude: parsed.data.latitude == null ? null : String(parsed.data.latitude),
      longitude: parsed.data.longitude == null ? null : String(parsed.data.longitude),
      visitedAt: parsed.data.visitedAt,
      mood: parsed.data.mood ?? "",
      story: parsed.data.story ?? "",
      sortOrder: parsed.data.sortOrder ?? null
    }
  };
}

function revalidateFootprintPaths() {
  revalidatePath("/");
  revalidatePath("/footprints");
  revalidatePath("/admin");
  revalidatePath("/admin/content/footprints");
}

async function replaceMemoryImages(
  tx: Prisma.TransactionClient,
  memoryId: string,
  mediaAssetIds: string[]
) {
  await tx.footprintMemoryImage.deleteMany({ where: { memoryId } });

  if (!mediaAssetIds.length) {
    return;
  }

  await tx.footprintMemoryImage.createMany({
    data: mediaAssetIds.map((mediaAssetId, index) => ({
      memoryId,
      mediaAssetId,
      sortOrder: index
    })),
    skipDuplicates: true
  });
}

export async function createFootprintPlace(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseCityInput(formData);
  if (!input) {
    return;
  }

  await prisma.footprintPlace.create({ data: input.data });

  revalidateFootprintPaths();
  redirect("/admin/content/footprints");
}

export async function updateFootprintPlace(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseCityInput(formData);
  if (!input?.id) {
    return;
  }

  await prisma.footprintPlace.update({
    where: { id: input.id },
    data: input.data
  });

  revalidateFootprintPaths();
  redirect(`/admin/content/footprints/${input.id}/edit`);
}

export async function deleteFootprintPlace(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return;
  }

  await prisma.footprintPlace.delete({ where: { id: parsed.data.id } });
  revalidateFootprintPaths();
  redirect("/admin/content/footprints");
}

export async function createFootprintMemory(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseMemoryInput(formData);
  if (!input) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const memory = await tx.footprintMemory.create({ data: input.data });
    await replaceMemoryImages(tx, memory.id, input.mediaAssetIds);
  });

  revalidateFootprintPaths();
  redirect(`/admin/content/footprints/${input.placeId}/edit`);
}

export async function updateFootprintMemory(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const input = parseMemoryInput(formData);
  if (!input?.id) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.footprintMemory.update({
      where: { id: input.id },
      data: input.data
    });
    await replaceMemoryImages(tx, input.id as string, input.mediaAssetIds);
  });

  revalidateFootprintPaths();
  redirect(`/admin/content/footprints/${input.placeId}/edit`);
}

export async function deleteFootprintMemory(formData: FormData): Promise<void> {
  "use server";

  await requireAdminCapability("content");

  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return;
  }

  const memory = await prisma.footprintMemory.findUnique({
    where: { id: parsed.data.id },
    select: { placeId: true }
  });

  if (!memory) {
    return;
  }

  await prisma.footprintMemory.delete({ where: { id: parsed.data.id } });
  revalidateFootprintPaths();
  redirect(`/admin/content/footprints/${memory.placeId}/edit`);
}
