import { z } from "zod";

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
