import { prisma } from "@/server/db/prisma";

export async function getAdminMusicTracks() {
  return prisma.musicTrack.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });
}

export async function getAdminMusicTrack(id: string) {
  return prisma.musicTrack.findUnique({
    where: { id }
  });
}
