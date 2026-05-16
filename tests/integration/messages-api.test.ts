import { beforeEach, describe, expect, it, vi } from "vitest";

const createMessage = vi.fn(async () => ({ id: "message_1" }));
const createVisitEvent = vi.fn(async () => ({ id: "visit_1" }));
const findVisitEvent = vi.fn(async () => null);
const upsertDailyStat = vi.fn(async () => ({ id: "stat_1" }));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    message: {
      create: createMessage
    },
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
  createMessage.mockClear();
  findVisitEvent.mockReset();
  findVisitEvent.mockResolvedValue(null);
  createVisitEvent.mockClear();
  upsertDailyStat.mockClear();
});

describe("visitor message API", () => {
  it("rejects short nickname and content", async () => {
    const { POST } = await import("@/app/api/messages/route");
    const response = await POST(
      new Request("http://localhost/api/messages", {
        method: "POST",
        body: JSON.stringify({ nickname: "a", content: "短" })
      })
    );

    expect(response.status).toBe(400);
    expect(createMessage).not.toHaveBeenCalled();
  });

  it("accepts valid visitor messages", async () => {
    const { POST } = await import("@/app/api/messages/route");
    const response = await POST(
      new Request("http://localhost/api/messages", {
        method: "POST",
        body: JSON.stringify({ nickname: "测试访客", content: "这是一条公开留言，等待审核后展示。" })
      })
    );

    expect(response.status).toBe(201);
    expect(createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          nickname: "测试访客",
          content: "这是一条公开留言，等待审核后展示。",
          status: "PENDING"
        })
      })
    );
  });
});

describe("visit analytics API", () => {
  it("records valid public visits", async () => {
    const { POST } = await import("@/app/api/visits/route");
    const response = await POST(
      new Request("http://localhost/api/visits", {
        method: "POST",
        body: JSON.stringify({ path: "/album", visitorId: "visitor-1" }),
        headers: {
          "user-agent": "Playwright",
          referer: "http://localhost/"
        }
      })
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true, recorded: true });
    expect(createVisitEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          path: "/album",
          ipHash: "visitor-1",
          userAgent: "Playwright",
          referrer: "http://localhost/"
        })
      })
    );
  });

  it("accepts ignored visit paths without writing records", async () => {
    const { POST } = await import("@/app/api/visits/route");
    const response = await POST(
      new Request("http://localhost/api/visits", {
        method: "POST",
        body: JSON.stringify({ path: "/admin", visitorId: "visitor-1" })
      })
    );

    expect(response.status).toBe(202);
    expect(createVisitEvent).not.toHaveBeenCalled();
    expect(upsertDailyStat).not.toHaveBeenCalled();
  });
});
