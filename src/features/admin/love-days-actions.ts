import { z } from "zod";

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
