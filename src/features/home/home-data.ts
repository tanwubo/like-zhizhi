import { getTogetherDays } from "@/lib/date";
import { prisma } from "@/server/db/prisma";
import { normalizeThemeSetting } from "@/features/admin/settings-data";

export async function getHomeData() {
  const [site, theme, people, modules, latestNote, messageCount, checklistCount, stats] =
    await Promise.all([
      prisma.siteSetting.findUniqueOrThrow({ where: { id: "site" } }),
      prisma.themeSetting.findUnique({ where: { id: "theme" } }),
      prisma.personProfile.findMany({ orderBy: { slot: "asc" } }),
      prisma.moduleSetting.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
      prisma.note.findFirst({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" } }),
      prisma.message.count({ where: { status: "APPROVED" } }),
      prisma.checklistItem.count({ where: { status: "PUBLISHED" } }),
      prisma.dailyStat.findFirst({ orderBy: { date: "desc" } })
    ]);

  return {
    site,
    theme: normalizeThemeSetting(theme),
    people,
    modules,
    latestNote,
    messageCount,
    checklistCount,
    visits: stats?.visits ?? 0,
    togetherDays: getTogetherDays(site.togetherDate)
  };
}
