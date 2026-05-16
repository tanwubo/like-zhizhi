import type { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { hashPassword } from "@/server/auth/password";
import { requireAdminCapability } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";

export type UserActionResult = { ok: true } | { ok: false; errors: Record<string, string[]> };

const roleSchema = z.enum(["OWNER", "PARTNER", "MODERATOR"]);

const userSchema = z.object({
  id: z.string().trim().optional(),
  email: z.preprocess(
    (value) => (typeof value === "string" ? value.trim().toLowerCase() : ""),
    z.string().min(1, "邮箱不能为空").email("邮箱格式不正确")
  ),
  name: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().min(1, "显示名称不能为空").max(80, "显示名称最多 80 个字符")
  ),
  role: roleSchema,
  password: z.preprocess((value) => (typeof value === "string" ? value : ""), z.string())
});

const idSchema = z.object({
  id: z.string().trim().min(1)
});

function resultFromError(error: z.ZodError): UserActionResult {
  const errors = Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1])
    )
  );

  return { ok: false, errors };
}

function passwordErrors(password: string, requirePassword: boolean) {
  if (!password && !requirePassword) return [];
  if (password.length < 8) return ["密码至少 8 位"];
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return ["密码必须包含字母和数字"];
  return [];
}

export function validateUserInput(
  formData: FormData,
  options: { requirePassword: boolean } = { requirePassword: false }
): UserActionResult {
  const parsed = userSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return resultFromError(parsed.error);
  }

  const errors = passwordErrors(parsed.data.password, options.requirePassword);
  if (errors.length > 0) {
    return { ok: false, errors: { password: errors } };
  }

  return { ok: true };
}

function parseUserInput(formData: FormData, options: { requirePassword: boolean }) {
  const parsed = userSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return null;
  }

  const errors = passwordErrors(parsed.data.password, options.requirePassword);
  if (errors.length > 0) {
    return null;
  }

  return parsed.data;
}

async function requireOwner() {
  return requireAdminCapability("users");
}

function revalidateUserPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function createUser(formData: FormData): Promise<void> {
  "use server";

  const currentUser = await requireOwner();
  const input = parseUserInput(formData, { requirePassword: true });

  if (!input) {
    return;
  }

  await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      role: input.role as UserRole,
      passwordHash: await hashPassword(input.password),
      disabledAt: null
    }
  });

  revalidateUserPaths();
  revalidatePath(`/admin/users/${currentUser.id}/edit`);
  redirect("/admin/users");
}

export async function updateUser(formData: FormData): Promise<void> {
  "use server";

  await requireOwner();
  const input = parseUserInput(formData, { requirePassword: false });

  if (!input?.id) {
    return;
  }

  const data: {
    email: string;
    name: string;
    role: UserRole;
    passwordHash?: string;
  } = {
    email: input.email,
    name: input.name,
    role: input.role as UserRole
  };

  if (input.password) {
    data.passwordHash = await hashPassword(input.password);
  }

  await prisma.user.update({
    where: { id: input.id },
    data
  });

  revalidateUserPaths();
  revalidatePath(`/admin/users/${input.id}/edit`);
  redirect("/admin/users");
}

export async function disableUser(formData: FormData): Promise<void> {
  "use server";

  const currentUser = await requireOwner();
  const parsed = idSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  if (parsed.data.id === currentUser.id) {
    throw new Error("不能禁用当前登录用户");
  }

  await prisma.user.update({
    where: { id: parsed.data.id },
    data: { disabledAt: new Date() }
  });
  await prisma.session.deleteMany({ where: { userId: parsed.data.id } });

  revalidateUserPaths();
  revalidatePath(`/admin/users/${parsed.data.id}/edit`);
  redirect("/admin/users");
}

export async function enableUser(formData: FormData): Promise<void> {
  "use server";

  await requireOwner();
  const parsed = idSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  await prisma.user.update({
    where: { id: parsed.data.id },
    data: { disabledAt: null }
  });

  revalidateUserPaths();
  revalidatePath(`/admin/users/${parsed.data.id}/edit`);
  redirect("/admin/users");
}
