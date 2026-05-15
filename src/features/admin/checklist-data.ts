import { prisma } from "@/server/db/prisma";

export async function getAdminChecklistItems() {
  return prisma.checklistItem.findMany({
    orderBy: [{ updatedAt: "desc" }]
  });
}

export async function getAdminChecklistItem(id: string) {
  return prisma.checklistItem.findUnique({
    where: { id }
  });
}
