import { prisma } from "@/server/db/prisma";

export async function getAdminLoveDayEvents() {
  return prisma.loveDayEvent.findMany({
    orderBy: [{ sortOrder: "asc" }, { date: "asc" }]
  });
}

export async function getAdminLoveDayEvent(id: string) {
  return prisma.loveDayEvent.findUnique({
    where: { id }
  });
}
