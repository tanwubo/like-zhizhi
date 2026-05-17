import { MessageStatus, PublishStatus } from "@prisma/client";

import { prisma } from "@/server/db/prisma";
import { normalizeThemeSetting } from "@/features/admin/settings-data";
import { getTogetherDays } from "@/lib/date";

export async function getHomeData() {
  const [
    site,
    theme,
    people,
    modules,
    latestNote,
    latestNotes,
    latestMessages,
    checklistPreview,
    albumPreview,
    footprintPreview,
    loveDayPreview,
    messageCount,
    checklistCount,
    albumCount,
    footprintCount,
    loveDayCount,
    stats
  ] =
    await Promise.all([
      prisma.siteSetting.findUniqueOrThrow({ where: { id: "site" } }),
      prisma.themeSetting.findUnique({ where: { id: "theme" } }),
      prisma.personProfile.findMany({ orderBy: { slot: "asc" } }),
      prisma.moduleSetting.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
      prisma.note.findFirst({ where: { status: PublishStatus.PUBLISHED }, orderBy: { publishedAt: "desc" } }),
      prisma.note.findMany({
        where: { status: PublishStatus.PUBLISHED },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 3,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          mood: true,
          location: true,
          publishedAt: true
        }
      }),
      prisma.message.findMany({
        where: { status: MessageStatus.APPROVED },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          nickname: true,
          content: true,
          location: true,
          createdAt: true
        }
      }),
      prisma.checklistItem.findMany({
        where: { status: PublishStatus.PUBLISHED },
        orderBy: [{ completed: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
        take: 6,
        select: {
          id: true,
          title: true,
          completed: true,
          targetDate: true,
          location: true
        }
      }),
      prisma.albumItem.findMany({
        where: { status: PublishStatus.PUBLISHED },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 3,
        include: { media: true }
      }),
      prisma.footprintPlace.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        include: {
          visits: {
            orderBy: { visitedAt: "desc" },
            take: 1
          }
        }
      }),
      prisma.loveDayEvent.findMany({
        orderBy: [{ sortOrder: "asc" }, { date: "asc" }],
        take: 6,
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          yearly: true
        }
      }),
      prisma.message.count({ where: { status: MessageStatus.APPROVED } }),
      prisma.checklistItem.count({ where: { status: PublishStatus.PUBLISHED } }),
      prisma.albumItem.count({ where: { status: PublishStatus.PUBLISHED } }),
      prisma.footprintPlace.count(),
      prisma.loveDayEvent.count(),
      prisma.dailyStat.findFirst({ orderBy: { date: "desc" } })
    ]);

  return {
    site,
    theme: normalizeThemeSetting(theme),
    people,
    modules,
    latestNote,
    latestNotes,
    latestMessages,
    checklistPreview,
    albumPreview,
    footprintPreview,
    loveDayPreview,
    messageCount,
    checklistCount,
    albumCount,
    footprintCount,
    loveDayCount,
    visits: stats?.visits ?? 0,
    togetherDays: getTogetherDays(site.togetherDate)
  };
}
