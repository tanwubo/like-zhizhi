import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

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

const optionalDateField = optionalText.pipe(
  z.string().refine((value) => !value || !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), "访问日期必须是有效日期")
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
  }, "封面地址必须是有效 URL")
);

const footprintSchema = z.object({
  id: z.string().optional(),
  visitId: z.string().optional(),
  name: formText("地点名称不能为空", [120, "地点名称最多 120 个字符"]),
  description: formText("地点说明不能为空", [1000, "地点说明最多 1000 个字符"]),
  latitude: coordinate("纬度不能为空", "纬度必须在 -90 到 90 之间", -90, 90),
  longitude: coordinate("经度不能为空", "经度必须在 -180 到 180 之间", -180, 180),
  coverUrl: optionalUrlField,
  visitTitle: optionalText.pipe(z.string().max(120, "访问标题最多 120 个字符")),
  visitDescription: optionalText.pipe(z.string().max(1000, "访问说明最多 1000 个字符")),
  visitedAt: optionalDateField
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

export function validateFootprintInput(formData: FormData): FootprintActionResult {
  const parsed = footprintSchema.safeParse(Object.fromEntries(formData));

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

function parseFootprintInput(formData: FormData) {
  const parsed = footprintSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return null;
  }

  const latitude = String(parsed.data.latitude);
  const longitude = String(parsed.data.longitude);
  const visitDate = optionalDate(parsed.data.visitedAt);
  const hasVisit = Boolean(parsed.data.visitTitle && parsed.data.visitDescription && visitDate);

  return {
    id: parsed.data.id,
    place: {
      name: parsed.data.name,
      description: parsed.data.description,
      latitude,
      longitude,
      coverUrl: parsed.data.coverUrl || null
    },
    visit: hasVisit
      ? {
          id: parsed.data.visitId,
          title: parsed.data.visitTitle || "",
          description: parsed.data.visitDescription || "",
          visitedAt: visitDate as Date
        }
      : null
  };
}

function revalidateFootprintPaths() {
  revalidatePath("/");
  revalidatePath("/footprints");
  revalidatePath("/admin");
  revalidatePath("/admin/content/footprints");
}

export async function createFootprintPlace(formData: FormData): Promise<void> {
  "use server";

  const input = parseFootprintInput(formData);
  if (!input) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const place = await tx.footprintPlace.create({ data: input.place });

    if (input.visit) {
      await tx.footprintVisit.create({
        data: {
          placeId: place.id,
          title: input.visit.title,
          description: input.visit.description,
          visitedAt: input.visit.visitedAt
        }
      });
    }
  });

  revalidateFootprintPaths();
  redirect("/admin/content/footprints");
}

export async function updateFootprintPlace(formData: FormData): Promise<void> {
  "use server";

  const input = parseFootprintInput(formData);
  if (!input?.id) {
    return;
  }

  const placeId = input.id;

  await prisma.$transaction(async (tx) => {
    await tx.footprintPlace.update({
      where: { id: placeId },
      data: input.place
    });

    if (input.visit?.id) {
      await tx.footprintVisit.update({
        where: { id: input.visit.id },
        data: {
          title: input.visit.title,
          description: input.visit.description,
          visitedAt: input.visit.visitedAt
        }
      });
    } else if (input.visit) {
      await tx.footprintVisit.create({
        data: {
          placeId,
          title: input.visit.title,
          description: input.visit.description,
          visitedAt: input.visit.visitedAt
        }
      });
    }
  });

  revalidateFootprintPaths();
  redirect("/admin/content/footprints");
}

export async function deleteFootprintPlace(formData: FormData): Promise<void> {
  "use server";

  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return;
  }

  await prisma.footprintPlace.delete({ where: { id: parsed.data.id } });
  revalidateFootprintPaths();
  redirect("/admin/content/footprints");
}

export async function deleteFootprintVisit(formData: FormData): Promise<void> {
  "use server";

  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return;
  }

  await prisma.footprintVisit.delete({ where: { id: parsed.data.id } });
  revalidateFootprintPaths();
  redirect("/admin/content/footprints");
}
