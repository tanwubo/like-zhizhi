import { prisma } from "@/server/db/prisma";

export async function getDashboardData() {
  const [notes, messages, checklist, album, modules, latestMessages] = await Promise.all([
    prisma.note.count(),
    prisma.message.count(),
    prisma.checklistItem.count(),
    prisma.albumItem.count(),
    prisma.moduleSetting.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 5 })
  ]);

  return {
    totals: { notes, messages, checklist, album },
    modules,
    latestMessages
  };
}
