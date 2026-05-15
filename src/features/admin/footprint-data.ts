import { prisma } from "@/server/db/prisma";

export async function getAdminFootprintPlaces() {
  return prisma.footprintPlace.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: { visits: { orderBy: { visitedAt: "desc" } } }
  });
}

export async function getAdminFootprintPlace(id: string) {
  return prisma.footprintPlace.findUnique({
    where: { id },
    include: { visits: { orderBy: { visitedAt: "desc" } } }
  });
}
