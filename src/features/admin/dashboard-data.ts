import { prisma } from "@/server/db/prisma";

export async function getDashboardData() {
  const [notes, messages, checklist, album, modules, latestMessages, latestStat] = await Promise.all([
    prisma.note.count(),
    prisma.message.count(),
    prisma.checklistItem.count(),
    prisma.albumItem.count(),
    prisma.moduleSetting.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.dailyStat.findFirst({ orderBy: { date: "desc" } })
  ]);

  return {
    totals: { notes, messages, checklist, album },
    analytics: {
      visits: latestStat?.visits ?? 0,
      uniqueVisitors: latestStat?.uniqueVisitors ?? 0,
      messages: latestStat?.messages ?? 0,
      notes: latestStat?.notes ?? 0
    },
    modules,
    latestMessages
  };
}
