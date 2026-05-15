import { MessageStatus, PublishStatus } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

const moduleRoutes: Record<string, string> = {
  home: "/",
  notes: "/notes",
  messages: "/messages",
  footprints: "/footprints",
  album: "/album",
  checklist: "/checklist",
  "love-days": "/love-days",
  about: "/about"
};

export function mapModuleToRoute(key: string) {
  return moduleRoutes[key] ?? null;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatLoveDay(start: Date, now = new Date()) {
  const days = Math.max(
    0,
    Math.floor(
      (startOfLocalDay(now).getTime() - startOfLocalDay(start).getTime()) / 86_400_000
    )
  );

  return {
    days,
    label: `已一起 ${days} 天`
  };
}

export async function getPublishedNotes(limit = 12) {
  return prisma.note.findMany({
    where: { status: PublishStatus.PUBLISHED },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      mood: true,
      weather: true,
      location: true,
      publishedAt: true
    }
  });
}

export async function getPublishedNoteBySlug(slug: string) {
  return prisma.note.findFirst({
    where: { slug, status: PublishStatus.PUBLISHED },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      mood: true,
      weather: true,
      location: true,
      publishedAt: true
    }
  });
}

export async function getApprovedMessages(limit = 30) {
  return prisma.message.findMany({
    where: { status: MessageStatus.APPROVED },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      nickname: true,
      content: true,
      location: true,
      createdAt: true,
      replies: {
        orderBy: { createdAt: "asc" },
        select: { id: true, content: true, createdAt: true }
      }
    }
  });
}

export async function getChecklistItems() {
  return prisma.checklistItem.findMany({
    where: { status: PublishStatus.PUBLISHED },
    orderBy: [{ completed: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
  });
}

export async function getAlbumItems(limit = 24) {
  return prisma.albumItem.findMany({
    where: { status: PublishStatus.PUBLISHED },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    include: { media: true }
  });
}

export async function getFootprintPlaces() {
  return prisma.footprintPlace.findMany({
    orderBy: { createdAt: "desc" },
    include: { visits: { orderBy: { visitedAt: "desc" } } }
  });
}

export async function getLoveDayEvents(now = new Date()) {
  const events = await prisma.loveDayEvent.findMany({
    orderBy: [{ sortOrder: "asc" }, { date: "asc" }]
  });

  return events.map((event) => ({
    ...event,
    counter: formatLoveDay(event.date, now)
  }));
}
