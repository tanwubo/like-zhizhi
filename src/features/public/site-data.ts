import { daysBetween } from "@/lib/date";
import { prisma } from "@/server/db/prisma";
import { normalizeThemeSetting } from "@/features/admin/settings-data";

import { getPublicNavigation } from "./navigation";

export async function getPublicSiteData() {
  const [site, theme, people, navigation, latestStat] = await Promise.all([
    prisma.siteSetting.findUniqueOrThrow({ where: { id: "site" } }),
    prisma.themeSetting.findUnique({ where: { id: "theme" } }),
    prisma.personProfile.findMany({ orderBy: { slot: "asc" } }),
    getPublicNavigation(),
    prisma.dailyStat.findFirst({ orderBy: { date: "desc" } })
  ]);

  return {
    site,
    theme: normalizeThemeSetting(theme),
    people,
    navigation,
    stats: {
      togetherDays: daysBetween(site.togetherDate, new Date()),
      visits: latestStat?.visits ?? 0,
      uniqueVisitors: latestStat?.uniqueVisitors ?? 0,
      messages: latestStat?.messages ?? 0,
      notes: latestStat?.notes ?? 0
    }
  };
}
