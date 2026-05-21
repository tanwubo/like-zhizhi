import { MediaType } from "@/server/db/enums";

import { prisma } from "@/server/db/prisma";

export async function getAdminFootprintPlaces() {
  return prisma.footprintPlace.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    include: {
      memories: {
        orderBy: [{ sortOrder: "asc" }, { visitedAt: "desc" }],
        include: {
          images: {
            include: { mediaAsset: true },
            orderBy: { sortOrder: "asc" }
          }
        }
      }
    }
  });
}

export async function getAdminFootprintPlace(id: string) {
  return prisma.footprintPlace.findUnique({
    where: { id },
    include: {
      memories: {
        orderBy: [{ sortOrder: "asc" }, { visitedAt: "desc" }],
        include: {
          images: {
            include: { mediaAsset: true },
            orderBy: { sortOrder: "asc" }
          }
        }
      }
    }
  });
}

export async function getFootprintImageAssets() {
  return prisma.mediaAsset.findMany({
    where: { type: MediaType.IMAGE },
    orderBy: { createdAt: "desc" },
    take: 100
  });
}
