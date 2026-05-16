import { beforeEach, describe, expect, it, vi } from "vitest";

const createVisitEvent = vi.fn(async () => ({ id: "visit_1" }));
const findVisitEvent = vi.fn(async () => null);
const upsertDailyStat = vi.fn(async () => ({ id: "stat_1" }));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    visitEvent: {
      findFirst: findVisitEvent,
      create: createVisitEvent
    },
    dailyStat: {
      upsert: upsertDailyStat
    }
  }
}));

beforeEach(() => {
  createVisitEvent.mockClear();
  findVisitEvent.mockReset();
  findVisitEvent.mockResolvedValue(null);
  upsertDailyStat.mockClear();
});

describe("visit analytics", () => {
  it("records a public page visit and increments the daily counters", async () => {
    const { recordVisitEvent } = await import("@/server/analytics/visits");
    const now = new Date("2026-05-16T11:22:33.000Z");

    const result = await recordVisitEvent({
      path: "/notes?from=nav",
      visitorId: "visitor-1",
      userAgent: "Playwright",
      referrer: "https://example.com/",
      now
    });

    expect(result).toEqual({ recorded: true });
    expect(createVisitEvent).toHaveBeenCalledWith({
      data: {
        path: "/notes",
        ipHash: "visitor-1",
        userAgent: "Playwright",
        referrer: "https://example.com/"
      }
    });
    expect(upsertDailyStat).toHaveBeenCalledWith({
      where: { date: new Date("2026-05-16T00:00:00.000Z") },
      create: {
        date: new Date("2026-05-16T00:00:00.000Z"),
        visits: 1,
        uniqueVisitors: 1,
        messages: 0,
        notes: 0
      },
      update: {
        visits: { increment: 1 },
        uniqueVisitors: { increment: 1 }
      }
    });
  });

  it("ignores admin, api, asset, and invalid paths", async () => {
    const { recordVisitEvent } = await import("@/server/analytics/visits");

    await expect(recordVisitEvent({ path: "/admin", visitorId: "v1" })).resolves.toEqual({ recorded: false });
    await expect(recordVisitEvent({ path: "/api/messages", visitorId: "v1" })).resolves.toEqual({ recorded: false });
    await expect(recordVisitEvent({ path: "/_next/static/app.js", visitorId: "v1" })).resolves.toEqual({ recorded: false });
    await expect(recordVisitEvent({ path: "not-a-path", visitorId: "v1" })).resolves.toEqual({ recorded: false });

    expect(createVisitEvent).not.toHaveBeenCalled();
    expect(upsertDailyStat).not.toHaveBeenCalled();
  });

  it("does not increment unique visitors when the visitor already has an event that day", async () => {
    const { recordVisitEvent } = await import("@/server/analytics/visits");

    findVisitEvent.mockResolvedValueOnce({ id: "existing_visit" });

    await recordVisitEvent({
      path: "/album",
      visitorId: "visitor-1",
      now: new Date("2026-05-16T18:00:00.000Z")
    });

    expect(upsertDailyStat).toHaveBeenCalledWith(
      expect.objectContaining({
        update: {
          visits: { increment: 1 },
          uniqueVisitors: { increment: 0 }
        }
      })
    );
  });
});
