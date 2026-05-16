import { prisma } from "@/server/db/prisma";

type RecordVisitInput = {
  path: string;
  visitorId?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  now?: Date;
};

type RecordVisitResult = {
  recorded: boolean;
};

const ignoredPrefixes = ["/admin", "/api", "/_next", "/favicon.ico", "/robots.txt", "/sitemap.xml"];

function normalizePath(path: string) {
  if (!path.startsWith("/")) {
    return null;
  }

  const [pathname] = path.split("?");
  const normalized = pathname.replace(/\/+$/, "") || "/";

  if (ignoredPrefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) {
    return null;
  }

  return normalized;
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function incrementDailyStat(kind: "messages" | "notes", now = new Date()) {
  const dayStart = startOfUtcDay(now);

  await prisma.dailyStat.upsert({
    where: { date: dayStart },
    create: {
      date: dayStart,
      visits: 0,
      uniqueVisitors: 0,
      messages: kind === "messages" ? 1 : 0,
      notes: kind === "notes" ? 1 : 0
    },
    update: {
      [kind]: { increment: 1 }
    }
  });
}

export async function recordVisitEvent(input: RecordVisitInput): Promise<RecordVisitResult> {
  const path = normalizePath(input.path);

  if (!path) {
    return { recorded: false };
  }

  const now = input.now ?? new Date();
  const dayStart = startOfUtcDay(now);
  const nextDayStart = new Date(dayStart);
  nextDayStart.setUTCDate(nextDayStart.getUTCDate() + 1);

  const existingVisitorEvent = input.visitorId
    ? await prisma.visitEvent.findFirst({
        where: {
          ipHash: input.visitorId,
          createdAt: {
            gte: dayStart,
            lt: nextDayStart
          }
        },
        select: { id: true }
      })
    : null;

  await prisma.visitEvent.create({
    data: {
      path,
      ipHash: input.visitorId || null,
      userAgent: input.userAgent || null,
      referrer: input.referrer || null
    }
  });

  await prisma.dailyStat.upsert({
    where: { date: dayStart },
    create: {
      date: dayStart,
      visits: 1,
      uniqueVisitors: existingVisitorEvent ? 0 : 1,
      messages: 0,
      notes: 0
    },
    update: {
      visits: { increment: 1 },
      uniqueVisitors: { increment: existingVisitorEvent ? 0 : 1 }
    }
  });

  return { recorded: true };
}
