import { beforeEach, describe, expect, it, vi } from "vitest";

const countNotes = vi.fn(async () => 3);
const countMessages = vi.fn(async () => 4);
const countChecklist = vi.fn(async () => 5);
const countAlbum = vi.fn(async () => 6);
const findModules = vi.fn(async () => []);
const findLatestMessages = vi.fn(async () => []);
const findLatestStat = vi.fn(async () => ({
  visits: 120,
  uniqueVisitors: 42,
  messages: 9,
  notes: 7
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    note: { count: countNotes },
    message: { count: countMessages, findMany: findLatestMessages },
    checklistItem: { count: countChecklist },
    albumItem: { count: countAlbum },
    moduleSetting: { findMany: findModules },
    dailyStat: { findFirst: findLatestStat }
  }
}));

beforeEach(() => {
  countNotes.mockClear();
  countMessages.mockClear();
  countChecklist.mockClear();
  countAlbum.mockClear();
  findModules.mockClear();
  findLatestMessages.mockClear();
  findLatestStat.mockClear();
});

describe("admin dashboard data", () => {
  it("includes latest analytics totals for dashboard cards", async () => {
    const { getDashboardData } = await import("@/features/admin/dashboard-data");

    const data = await getDashboardData();

    expect(data.analytics).toEqual({
      visits: 120,
      uniqueVisitors: 42,
      messages: 9,
      notes: 7
    });
    expect(findLatestStat).toHaveBeenCalledWith({ orderBy: { date: "desc" } });
  });

  it("returns zero analytics totals when no daily stat exists", async () => {
    const { getDashboardData } = await import("@/features/admin/dashboard-data");

    findLatestStat.mockResolvedValueOnce(null);

    await expect(getDashboardData()).resolves.toMatchObject({
      analytics: {
        visits: 0,
        uniqueVisitors: 0,
        messages: 0,
        notes: 0
      }
    });
  });
});
