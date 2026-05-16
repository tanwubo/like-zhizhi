import { notFound, redirect } from "next/navigation";

import { canManageUsers } from "@/server/auth/roles";
import { getCurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

export async function requireUserManager() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!canManageUsers(user.role)) {
    redirect("/admin");
  }

  return user;
}

export async function getAdminUsers() {
  return prisma.user.findMany({
    orderBy: [{ disabledAt: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      disabledAt: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function getAdminUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      disabledAt: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    notFound();
  }

  return user;
}
