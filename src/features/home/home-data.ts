import { getTogetherDays } from "@/lib/date";
import { prisma } from "@/server/db/prisma";

export async function getHomeData() {
  const [site, people, modules, latestNote, messageCount, checklistCount, stats] =
    await Promise.all([
      prisma.siteSetting.findUniqueOrThrow({ where: { id: "site" } }),
      prisma.personProfile.findMany({ orderBy: { slot: "asc" } }),
      prisma.moduleSetting.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
      prisma.note.findFirst({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" } }),
      prisma.message.count({ where: { status: "APPROVED" } }),
      prisma.checklistItem.count({ where: { status: "PUBLISHED" } }),
      prisma.dailyStat.findFirst({ orderBy: { date: "desc" } })
    ]);

  return {
    site,
    people,
    modules,
    latestNote,
    messageCount,
    checklistCount,
    visits: stats?.visits ?? 0,
    togetherDays: getTogetherDays(site.togetherDate)
  };
}
