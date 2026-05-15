import { prisma } from "@/server/db/prisma";

export async function getAdminAlbumItems() {
  return prisma.albumItem.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: { media: true }
  });
}

export async function getAdminAlbumItem(id: string) {
  return prisma.albumItem.findUnique({
    where: { id },
    include: { media: true }
  });
}
