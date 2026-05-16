import { prisma } from "@/server/db/prisma";

export async function getAdminMediaAssets() {
  return prisma.mediaAsset.findMany({
    orderBy: [{ createdAt: "desc" }]
  });
}
